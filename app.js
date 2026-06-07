// Coffee Water Recipe Calculator - Logic & Interaction
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const recipePreset = document.getElementById('recipe-preset');
  const waterVolume = document.getElementById('water-volume');
  const volumeUnit = document.getElementById('volume-unit');
  const hardnessUnit = document.getElementById('hardness-unit');
  
  const targetGH = document.getElementById('target-gh');
  const targetGHSlider = document.getElementById('target-gh-slider');
  const targetKH = document.getElementById('target-kh');
  const targetKHSlider = document.getElementById('target-kh-slider');
  
  const epsomWeightGrams = document.getElementById('epsom-weight-grams');
  const epsomWeightMg = document.getElementById('epsom-weight-mg');
  const khco3WeightGrams = document.getElementById('khco3-weight-grams');
  const khco3WeightMg = document.getElementById('khco3-weight-mg');
  
  const precisionAlert = document.getElementById('precision-alert');
  const flavorPrediction = document.getElementById('flavor-prediction');
  const canvas = document.getElementById('flavor-chart');
  
  // Standard Constants
  const PPM_PER_DGH = 17.848;
  const EPSOM_DIVISOR = 406.08; // 1g Epsom salt in 1L = 406.08 ppm GH (as CaCO3)
  const KHCO3_DIVISOR = 499.86; // 1g KHCO3 in 1L = 499.86 ppm KH (as CaCO3)
  
  // Preset recipes in ppm CaCO3 equivalent
  const presets = {
    'sca-perger': { gh: 68.6, kh: 40.1 },
    'bh-80-40': { gh: 80.7, kh: 40.1 },
    'melbourne': { gh: 23.7, kh: 11.5 },
    'budapest': { gh: 51.2, kh: 40.1 },
    'rao': { gh: 75.7, kh: 50.1 },
    'hendon': { gh: 99.9, kh: 30.8 },
    'pretty-hard': { gh: 126.1, kh: 35.1 },
    'hard-af': { gh: 176.8, kh: 45.2 }
  };

  // State
  let currentUnit = 'ppm'; // 'ppm' or 'dgh'

  // Volume scale factors to convert to Liters
  const getVolumeInLiters = () => {
    const vol = parseFloat(waterVolume.value);
    if (isNaN(vol) || vol <= 0) return 0;
    
    const unit = volumeUnit.value;
    switch (unit) {
      case 'mL': return vol * 0.001;
      case 'gal': return vol * 3.78541;
      case 'oz': return vol * 0.0295735;
      case 'L':
      default: return vol;
    }
  };

  // Convert target values to ppm for calculations
  const getTargetPPM = () => {
    let ghVal = parseFloat(targetGH.value) || 0;
    let khVal = parseFloat(targetKH.value) || 0;
    
    if (currentUnit === 'dgh') {
      ghVal *= PPM_PER_DGH;
      khVal *= PPM_PER_DGH;
    }
    return { gh: ghVal, kh: khVal };
  };

  // Sync Slider to Input Number
  const syncSliderToInput = (slider, input) => {
    input.value = slider.value;
  };

  // Sync Input Number to Slider
  const syncInputToSlider = (input, slider) => {
    const val = parseFloat(input.value);
    if (!isNaN(val)) {
      slider.value = val;
    }
  };

  // Setup slider min/max/step based on selected unit
  const updateSliderLimits = () => {
    if (hardnessUnit.value === 'ppm') {
      targetGHSlider.min = '0';
      targetGHSlider.max = '300';
      targetGHSlider.step = '0.5';
      targetGH.min = '0';
      targetGH.max = '300';
      targetGH.step = '0.1';
      document.querySelectorAll('.text-unit').forEach(el => el.textContent = 'ppm');
    } else {
      // dGH / dKH
      targetGHSlider.min = '0';
      targetGHSlider.max = '17';
      targetGHSlider.step = '0.1';
      targetGH.min = '0';
      targetGH.max = '17';
      targetGH.step = '0.1';
      document.querySelectorAll('.text-unit').forEach(el => el.textContent = '°dGH/dKH');
    }
  };

  // Calculations
  const calculate = () => {
    const volumeL = getVolumeInLiters();
    if (volumeL <= 0) {
      epsomWeightGrams.textContent = '0.000';
      epsomWeightMg.textContent = '(0.0 mg)';
      khco3WeightGrams.textContent = '0.000';
      khco3WeightMg.textContent = '(0.0 mg)';
      precisionAlert.style.display = 'none';
      return;
    }

    const { gh, kh } = getTargetPPM();

    // Epsom salt (MgSO4 * 7H2O) grams
    const epsomGrams = (gh * volumeL) / EPSOM_DIVISOR;
    // Potassium Bicarbonate (KHCO3) grams
    const khco3Grams = (kh * volumeL) / KHCO3_DIVISOR;

    // Output formatting
    epsomWeightGrams.textContent = epsomGrams.toFixed(3);
    epsomWeightMg.textContent = `(${(epsomGrams * 1000).toFixed(1)} mg)`;
    khco3WeightGrams.textContent = khco3Grams.toFixed(3);
    khco3WeightMg.textContent = `(${(khco3Grams * 1000).toFixed(1)} mg)`;

    // Warning trigger
    if ((epsomGrams > 0 && epsomGrams < 0.05) || (khco3Grams > 0 && khco3Grams < 0.05)) {
      precisionAlert.style.display = 'block';
    } else {
      precisionAlert.style.display = 'none';
    }

    // Flavor prediction and chart update
    updateFlavorPrediction(gh, kh);
    drawChart(gh, kh);
  };

  // Flavor Prediction logic
  const updateFlavorPrediction = (gh, kh) => {
    let prediction = '';
    
    if (gh < 20 && kh < 15) {
      prediction = '极软水：萃取力极弱，口感偏清淡，类似茶感 (Very Soft)';
    } else if (kh > 60) {
      prediction = '高缓冲水：酸度会被完全中和，口感沉闷、平淡且带泥土味 (Muted Acidity, Flat)';
    } else if (kh < 20 && gh > 60) {
      prediction = '酸度高锐度：酸感强且偏尖锐，甜感不足 (Sharp, Sour)';
    } else if (gh > 130) {
      prediction = '高硬度水：萃取过度，易出现粉感、涩感与苦味 (Heavy, Chalky & Astringent)';
    } else if (gh >= 50 && gh <= 100 && kh >= 25 && kh <= 50) {
      prediction = 'SCA 黄金平衡：酸甜均衡，风味清晰且层次丰富 (Balanced & Sweet)';
    } else {
      prediction = '定制中等水质：偏向特定萃取风格 (Custom Tailored)';
    }

    flavorPrediction.textContent = prediction;
  };

  // Canvas drawing for the GH/KH chart
  const drawChart = (targetGH_ppm, targetKH_ppm) => {
    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    
    // Clear and set pixel ratio for crisp text
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 45;
    const graphWidth = canvas.width - padding * 2;
    const graphHeight = canvas.height - padding * 2;

    // Max values on axis
    const maxKH = 100; // X axis
    const maxGH = 180; // Y axis

    // Coordinate conversion helpers
    const getX = (kh) => padding + (kh / maxKH) * graphWidth;
    const getY = (gh) => canvas.height - padding - (gh / maxGH) * graphHeight;

    // Draw background zones
    // 1. Weak/Soft zone (Low GH, Low KH)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(padding, getY(180), (30/maxKH)*graphWidth, (180/maxGH)*graphHeight);

    // 2. Sweet/Balanced Zone (GH 50-100, KH 25-50)
    ctx.fillStyle = '#dcfce7'; // green-100
    const xStart = getX(25);
    const xEnd = getX(50);
    const yStart = getY(100);
    const yEnd = getY(50);
    ctx.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);

    // 3. Sharp/Sour Zone (Low KH, High GH)
    ctx.fillStyle = '#fee2e2'; // red-100
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(50));
    ctx.lineTo(getX(25), getY(50));
    ctx.lineTo(getX(25), getY(180));
    ctx.lineTo(getX(0), getY(180));
    ctx.closePath();
    ctx.fill();

    // 4. Flat/Muted Zone (High KH)
    ctx.fillStyle = '#fef3c7'; // amber-100
    ctx.fillRect(getX(50), getY(180), ((maxKH - 50)/maxKH)*graphWidth, (180/maxGH)*graphHeight);

    // 5. Heavy/Over-extracted Zone (High GH, Low/Medium KH)
    ctx.fillStyle = '#e0e7ff'; // indigo-100
    ctx.fillRect(getX(0), getY(180), (50/maxKH)*graphWidth, (80/maxGH)*graphHeight);

    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Y Axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    // X Axis
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Grid lines & Axis Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '500 10px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // X Axis Labels (KH)
    const khTicks = [0, 25, 50, 75, 100];
    khTicks.forEach(tick => {
      const x = getX(tick);
      ctx.fillText(tick, x, canvas.height - padding + 5);
      
      // dotted grid line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    });

    // Y Axis Labels (GH)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const ghTicks = [0, 50, 100, 150, 180];
    ghTicks.forEach(tick => {
      const y = getY(tick);
      ctx.fillText(tick, padding - 8, y);
      
      // grid line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    });

    // Axis titles
    ctx.fillStyle = '#475569';
    ctx.font = '600 10px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    // X title
    ctx.fillText('碱度 KH (ppm as CaCO₃)', canvas.width / 2, canvas.height - 15);
    // Y title
    ctx.save();
    ctx.translate(12, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('总硬度 GH (ppm as CaCO₃)', 0, 0);
    ctx.restore();

    // Zone text labels
    ctx.font = '500 9px Plus Jakarta Sans';
    ctx.fillStyle = '#047857'; // Green
    ctx.fillText('均衡甜感 (SCA)', getX(37.5), getY(75));

    ctx.fillStyle = '#be123c'; // Red
    ctx.fillText('强酸感 (Acidic)', getX(12.5), getY(120));

    ctx.fillStyle = '#b45309'; // Amber
    ctx.fillText('平淡木然 (Flat)', getX(75), getY(100));

    ctx.fillStyle = '#4f46e5'; // Indigo
    ctx.fillText('重度涩口 (Chalky)', getX(25), getY(160));

    ctx.fillStyle = '#475569'; // Slate
    ctx.fillText('软水淡薄 (Weak)', getX(12.5), getY(25));

    // Draw current target dot
    const targetX = getX(Math.min(targetKH_ppm, maxKH));
    const targetY = getY(Math.min(targetGH_ppm, maxGH));

    // Glow effect
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(180, 83, 9, 0.5)';
    ctx.fillStyle = '#b45309'; // Amber 700
    ctx.beginPath();
    ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner dot
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Update target fields when a preset is chosen
  const applyPreset = (presetKey) => {
    if (presetKey === 'custom') return;
    
    const { gh, kh } = presets[presetKey];
    
    if (currentUnit === 'ppm') {
      targetGH.value = gh.toFixed(1);
      targetKH.value = kh.toFixed(1);
      targetGHSlider.value = gh;
      targetKHSlider.value = kh;
    } else {
      const ghD = (gh / PPM_PER_DGH).toFixed(1);
      const khD = (kh / PPM_PER_DGH).toFixed(1);
      targetGH.value = ghD;
      targetKH.value = khD;
      targetGHSlider.value = ghD;
      targetKHSlider.value = khD;
    }
    calculate();
  };

  // Listeners for sliders & input boxes
  targetGHSlider.addEventListener('input', () => {
    syncSliderToInput(targetGHSlider, targetGH);
    recipePreset.value = 'custom';
    calculate();
  });

  targetKHSlider.addEventListener('input', () => {
    syncSliderToInput(targetKHSlider, targetKH);
    recipePreset.value = 'custom';
    calculate();
  });

  targetGH.addEventListener('input', () => {
    syncInputToSlider(targetGH, targetGHSlider);
    recipePreset.value = 'custom';
    calculate();
  });

  targetKH.addEventListener('input', () => {
    syncInputToSlider(targetKH, targetKHSlider);
    recipePreset.value = 'custom';
    calculate();
  });

  // Preset Selector change
  recipePreset.addEventListener('change', () => {
    applyPreset(recipePreset.value);
  });

  // Volume inputs change
  waterVolume.addEventListener('input', calculate);
  volumeUnit.addEventListener('change', calculate);

  // Unit changes (ppm vs dGH)
  hardnessUnit.addEventListener('change', () => {
    const newUnit = hardnessUnit.value;
    if (newUnit === currentUnit) return;

    let ghVal = parseFloat(targetGH.value) || 0;
    let khVal = parseFloat(targetKH.value) || 0;

    if (newUnit === 'dgh') {
      // Convert ppm to dGH
      ghVal = ghVal / PPM_PER_DGH;
      khVal = khVal / PPM_PER_DGH;
    } else {
      // Convert dGH to ppm
      ghVal = ghVal * PPM_PER_DGH;
      khVal = khVal * PPM_PER_DGH;
    }

    currentUnit = newUnit;
    updateSliderLimits();

    targetGH.value = ghVal.toFixed(1);
    targetKH.value = khVal.toFixed(1);
    targetGHSlider.value = ghVal.toFixed(1);
    targetKHSlider.value = khVal.toFixed(1);

    calculate();
  });

  // Initialize
  updateSliderLimits();
  calculate();

  // Sync aria-invalid with native constraints
  const syncAria = (el) => {
    el.setAttribute?.('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
  };
  
  document.addEventListener('blur', (e) => syncAria(e.target), true);
  document.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
  });
});
