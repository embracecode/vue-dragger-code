class AdvancedFPSMonitor {
    constructor(options = {}) {
        this.options = {
            container: options.container || document.body,
            showChart: options.showChart !== false,
            warningThreshold: options.warningThreshold || 30,
            criticalThreshold: options.criticalThreshold || 20,
            ...options
        };
        
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fpsHistory = [];
        this.maxHistory = 120;
        
        this.initUI();
        this.start();
    }
    
    initUI() {
        // 创建显示面板
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 10000;
            min-width: 150px;
        `;
        
        this.fpsText = document.createElement('div');
        this.fpsText.textContent = 'FPS: --';
        
        this.statsText = document.createElement('div');
        this.statsText.textContent = 'Avg: -- Min: --';
        this.statsText.style.fontSize = '10px';
        this.statsText.style.opacity = '0.8';
        
        this.container.appendChild(this.fpsText);
        this.container.appendChild(this.statsText);
        
        this.options.container.appendChild(this.container);
    }
    
    start() {
        this.update();
    }
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > this.maxHistory) {
                this.fpsHistory.shift();
            }
            
            this.updateUI();
        }
        
        requestAnimationFrame(() => this.update());
    }
    
    updateUI() {
        this.fpsText.textContent = `FPS: ${this.fps}`;
        this.fpsText.style.color = this.getColorByFPS(this.fps);
        
        const avgFPS = this.getAverageFPS();
        const minFPS = this.getMinFPS();
        this.statsText.textContent = `Avg: ${avgFPS} Min: ${minFPS}`;
    }
    
    getColorByFPS(fps) {
        if (fps >= this.options.warningThreshold) return '#4CAF50';
        if (fps >= this.options.criticalThreshold) return '#FF9800';
        return '#F44336';
    }
    
    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }
    
    getMinFPS() {
        return this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0;
    }
    
    getReport() {
        return {
            currentFPS: this.fps,
            averageFPS: this.getAverageFPS(),
            minFPS: this.getMinFPS(),
            fpsHistory: [...this.fpsHistory]
        };
    }
}
export const fpsMonitor = new AdvancedFPSMonitor();