# 咖啡冲煮用水配方计算器 (Coffee Water Recipe Calculator)

这是一个精美、极简的单页面 Web 应用（SPA），旨在帮助咖啡爱好者和专业咖啡师精准计算**直加矿物盐（七水硫酸镁/泻盐与碳酸氢钾）**的用量。

👉 **在线预览与使用**: [https://allanchen2019.github.io/coffee-water-calculator/](https://allanchen2019.github.io/coffee-water-calculator/)

---

## 🌟 功能特点

1. **预设多种流行配方**:
   - **SCA Standard / Matt Perger**: 经典 68.6 ppm GH / 40.1 ppm KH。
   - **Barista Hustle 80/40**: 平衡型 80.7 ppm GH / 40.1 ppm KH。
   - **Melbourne Water 1.0**: 极软水 23.7 ppm GH / 11.5 ppm KH。
   - **WOC Budapest**: 布达佩斯世界赛水 51.2 ppm GH / 40.1 ppm KH。
   - **Rao Water**: 经典拉奥配方 75.7 ppm GH / 50.1 ppm KH。
   - **Hendon Water**: Christopher Hendon 理想萃取区 99.9 ppm GH / 30.8 ppm KH。
   - **Pretty Hard**: 适合短时间萃取 126.1 ppm GH / 35.1 ppm KH。
   - **Hard dot AF**: 高硬度极限水 176.8 ppm GH / 45.2 ppm KH。
   - **Custom (自定义)**: 自由滑动或输入设定 GH 与 KH 目标。

2. **直加用量精准计算**:
   - 输入目标水体体积（支持 L、mL、US Gal、US fl oz 等单位）。
   - 选择输入单位（ppm 或 dGH/dKH）。
   - 自动生成**七水硫酸镁 (MgSO₄ · 7H₂O)** 与 **碳酸氢钾 (KHCO₃)** 的克数及毫克数。

3. **风味萃取象限图**:
   - 2D Canvas 实时渲染 GH/KH 风味象限，直观预测当前水质是偏酸、偏苦涩、淡薄还是均衡甜美。

4. **秤量精度警告**:
   - 当所需称量值低于 0.05g 时，自动提示精度警告，建议使用 0.01g 天平或放大配水体积以降低误差。

---

## 🔬 化学原理与常数

- **总硬度 (GH) 镁离子计算**:
  Epsom 盐在 1L 纯水中提供 406.08 ppm 的等效 CaCO₃ 硬度。
  $$ \text{克数(Epsom)} = \frac{\text{目标GH (ppm)} \times \text{水体积(L)}}{406.08} $$

- **碱度 (KH) 缓冲计算**:
  碳酸氢钾在 1L 纯水中提供 499.86 ppm 的等效 CaCO₃ 碱度。
  $$ \text{克数(KHCO₃)} = \frac{\text{目标KH (ppm)} \times \text{水体积(L)}}{499.86} $$

---

## 🛠️ 直加调制标准步骤 (SOP)

1. **准备基水**：准备接近 0 ppm 的去离子水、反渗透水或蒸馏水。
2. **精密秤量**：使用 0.01g 精度电子天平，秤取对应克数的泻盐与碳酸氢钾。
3. **溶解摇匀**：取少量温水彻底溶解矿物盐粉末，随后倒入大桶基水中摇匀即可。

---

## ☕ 参考与致谢 (References & Acknowledgements)

本计算器的设计与数学模型建立过程中参考了以下优秀的项目与文献：

- **[coffeewater.app](https://coffeewater.app/)**：提供了绝佳的交互与直观水质计算界面灵感。
- **[Barista Hustle (Matt Perger)](https://www.baristahustle.com/blog/diy-water-recipes-redux/)**：经典 DIY 矿物浓缩配水法与 preset 预设值来源。
- **Dr. Christopher Hendon & Maxwell Colonna-Dashwood**：著作《*Water for Coffee*》奠定了咖啡冲煮水化学（GH/KH 相互关系）的理论基础。
- **Scott Rao**：对高品质冲煮水标准的实践经验总结。
