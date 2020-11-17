
import './lib/webaudio-controls.js';
const getBaseURL = () => {
  const base = new URL('.', import.meta.url);
  console.log("Base = " + base);
	return `${base}`;
};

const template = document.createElement("template");
template.innerHTML = `
    <style>
    section {
      margin: 0px auto;
      padding: 20px;
      width: 500px;
      border:  2px solid black;
      border-radius:10%;
      background-image: url("https://us.123rf.com/450wm/molaruso/molaruso1704/molaruso170400025/75360104-fond-technologie-abstraite-m%C3%A9tal-poli-texture-bross%C3%A9-chrome-argent-acier-aluminium-pour-les-concepts-de-.jpg?ver=6");
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      align-items: center;
      justify-content: center;
     }
       canvas {
         border :1px solid black;
         border-radius:10%;
         width:500px;
         margin:auto;
       }

       progress{
        border :1px solid black;
        border-radius:10%;
        height:2px;
        width:500px;
        background-color:gray;
       }
       audio {
        border :1px solid black;
        border-radius:10%;
        width:500px;
        background-color:gray;
       }
    </style>
    <section>
          <audio id="myPlayer" controls="controls" crossorigin>
          <source src="https://mainline.i3s.unice.fr/mooc/horse.ogg" type="audio/ogg" />
          <source src="https://mainline.i3s.unice.fr/mooc/horse.mp3" type="audio/mp3" />
          </audio>
          <br/>
          <hr/>
          <center>
            <img id="stopButton"  src="./assets/imgs/stop.jpg" style="width:70px; height:70px; border-radius:100%;">
            <img id="playButton"  src="./assets/imgs/play.jpg" style="width:70px; height:70px; border-radius:100%;">
            <img id="replayButton"  src="./assets/imgs/replay.jpg" style="width:70px; height:70px;border-radius:100%;">
            <img id="pauseButton"  src="./assets/imgs/pause.jpg" style="width:70px; height:70px;border-radius:100%;">
            <img id="previewButton"  src="./assets/imgs/preview.jpg" style="width:70px; height:70px;border-radius:100%;">
            <img id="nextButton"  src="./assets/imgs/next.jpg" style="width:70px; height:70px;border-radius:100%;">
          </center>
          <br/>
          <center>
          <br/>
          <progress id = "progressRuler" min=0  value=0 step=0.1></progress>
          <br/>
          <hr/>
          <webaudio-knob id="knobSteroe" tooltip="Volume:%s" src="./assets/imgs/metal.png" sprites="30" value=0 min="-1.5" max="1.5" step=0.1 diameter="128" style="height:128px">
              Balance G/D
          </webaudio-knob>
          <webaudio-knob id="jambalaya" src="./assets/imgs/metal.png" sprites="30" diameter="128" style="height:128px" min=0 max=3 step=0.1 value=1.5>
              Volume
          </webaudio-knob>
        <center>
          <br/><hr/>
          <canvas id = "myCanvas" width = 500 height = 100 ></canvas>
      </section>
    `;

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.volume = 1;

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.basePath = getBaseURL(); // url absolu du composant    <button onclick="afficheDetails()"></button>
    // Fix relative path in WebAudio Controls elements
    this.fixRelativeImagePaths();
  }

  connectedCallback() {
    this.player = this.shadowRoot.querySelector("#myPlayer");
    this.player.loop = true;

    // get the canvas, its graphic context...
    this.canvas = this.shadowRoot.querySelector("#myCanvas");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.canvasContext = this.canvas.getContext('2d');

    //creer un context webaudio
    //var ctx = window.AudioContext || window.webkitAudioContext;
    let audioContext = new AudioContext();
    //var mediaElement = document.querySelector('#player'); notre player existe deja c'est this.player
    let playerNode = audioContext.createMediaElementSource(this.player); //this.player est notre noeud source
       // Create a panner node
    this.pannerNode = audioContext.createStereoPanner();//creation du noeud steroe
       // Create an analyser node
    this.analyserNode = audioContext.createAnalyser();

    // set visualizer options, for lower precision change 1024 to 512,
    // 256, 128, 64 etc. bufferLength will be equal to fftSize/2
    this.analyserNode.fftSize = 1024;
    this.bufferLength = this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    playerNode
      .connect(this.pannerNode)
      .connect(this.analyserNode)
      .connect(audioContext.destination); // connect to the speakers

     // Connects the last filter to the speakers
     // this.filters[ this.filters.length-1].connect(this.pannerNode);

    this.visualize();
    this.declareListeners();

  }

  visualize() {
      //A Nettoyer le canvas 
      this.canvasContext.clearRect(0, 0, this.width, this.height);
      //B dessiner le canvas 

      // - Get the analyser data - for waveforms we need time domain data
      this.analyserNode.getByteTimeDomainData(this.dataArray);

      // 3 - draws the waveform
      this.canvasContext.lineWidth = 4;
      this.canvasContext.strokeStyle = 'gray';
    
      // the waveform is in one single path, first let's
      // clear any previous path that could be in the buffer
      this.canvasContext.beginPath();
      var sliceWidth = this.width / this.bufferLength;
      var x = 0;
    
      for(var i = 0; i < this.bufferLength; i++) {
        // dataArray values are between 0 and 255,
        // normalize v, now between 0 and 1
        var v = this.dataArray[i] / 255;
        // y will be in [0, canvas height], in pixels
        var y = v * this.height;
    
        if(i === 0) {
          this.canvasContext.moveTo(x, y);
        } else {
          this.canvasContext.lineTo(x, y);
        }
    
        x += sliceWidth;
      }
    
      this.canvasContext.lineTo(this.width, this.height/2);
      // draw the path at once
      this.canvasContext.stroke();
      // this.canvasContext.fillRect(0+20*Math.random(), 0, 100, 100);
      //C Rappeler l'animation
      requestAnimationFrame(() => {this.visualize()});
  }
  //Tous nos listeners
  declareListeners(){
    this.shadowRoot
        .querySelector("#playButton")
        .addEventListener("click", (event) => {
        this.play();
    });
    
    this.shadowRoot
    .querySelector("#previewButton")
    .addEventListener("click", (event) => {
    this.preview();
    });

    this.shadowRoot
    .querySelector("#nextButton")
    .addEventListener("click", (event) => {
    this.next();
    });

    this.shadowRoot
        .querySelector("#pauseButton")
        .addEventListener("click", (event) => {
      this.pause();
    });

    this.shadowRoot
    .querySelector("#replayButton")
    .addEventListener("click", (event) => {
     this.replay();
    });

    this.shadowRoot
    .querySelector("#stopButton")
    .addEventListener("click", (event) => {
     this.stop();
    });

    this.shadowRoot
       .querySelector("#knobSteroe")
       .addEventListener("input", (event)=>{
        //console.log(event.target.value);
        this.setBalance(event.target.value);
    });

    this.shadowRoot
    .querySelector("#jambalaya")
    .addEventListener("input", (event)=>{
    // console.log(event.target.value);
     this.setVolume(event.target.value);
 });
 

    this.player.addEventListener('timeupdate', (event) =>{
      console.log("time = " + this.player.currentTime + "total duration = " + this.player.duration);
      let p = this.shadowRoot.querySelector("#progressRuler");
      try{
        p.max = this.player.duration;
        p.value = this.player.currentTime;
      }catch(err){

      }
     
    })
  }

  fixRelativeImagePaths() {
		// change webaudiocontrols relative paths for spritesheets to absolute
		let webaudioControls = this.shadowRoot.querySelectorAll(
			'webaudio-knob, webaudio-slider, webaudio-switch, img'
		);
		webaudioControls.forEach((e) => {
			let currentImagePath = e.getAttribute('src');
			if (currentImagePath !== undefined) {
				//console.log("Got wc src as " + e.getAttribute("src"));
				let imagePath = e.getAttribute('src');
        //e.setAttribute('src', this.basePath  + "/" + imagePath);
        e.src = this.basePath  + "/" + imagePath;
        //console.log("After fix : wc src as " + e.getAttribute("src"));
			}
		});
  }
  //nos API
  setBalance(val){
    this.pannerNode.pan.value = val;
  }

  setVolume(val) {
    this.player.volume = val;
  }

  play() {
    this.player.play();
  }

  next(){
      this.player.currentTime += 10
  }

  preview(){
      this.player.currentTime -= 10
  }

  pause() {
    this.player.pause();
  }

  replay() {
    this.player.currentTime=0;
  }

  stop() {
    this.player.pause()
    this.player.currentTime = 0
  }


}

customElements.define("my-audioplayer", MyAudioPlayer);
