"use client"

// Web Audio API を用いた簡易サウンドエフェクト生成
class SoundSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // ユーザー操作前に初期化すると警告が出るため、初回再生時に初期化する
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // 短いクリック音
  public playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // 正解音（ピンポン！）
  public playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const playTone = (freq: number, startTime: number, duration: number) => {
      if(!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + startTime + 0.05);
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime + startTime + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    };

    playTone(659.25, 0, 0.2); // E5
    playTone(880.00, 0.2, 0.4); // A5
  }

  // エラー音（低く短い「ボッ」という音にして不快感を軽減）
  public playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle'; // sawtoothよりマイルドな音質
    osc.frequency.setValueAtTime(120, this.ctx.currentTime); // 低音
    
    // 音量を0.1に下げ、0.15秒で短くフェードアウト
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // クリア（ファンファーレ）
  public playClear() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const playTone = (freq: number, startTime: number, duration: number) => {
      if(!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + startTime + 0.05);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + startTime + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    };

    // ドミソド
    playTone(523.25, 0, 0.15); // C5
    playTone(659.25, 0.15, 0.15); // E5
    playTone(783.99, 0.3, 0.15); // G5
    playTone(1046.50, 0.45, 0.5); // C6
  }
}

export const sounds = typeof window !== 'undefined' ? new SoundSystem() : null;
