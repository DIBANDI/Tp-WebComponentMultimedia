
import './lib/webaudio-controls.js';

const getBaseURL = () => {
  const base = new URL('.', import.meta.url);
  console.log("Base = " + base);
	return `${base}`;
};

const template = document.createElement("template");
template.innerHTML = `
  <style>
    H1 {
          color:red;
    }
  </style>
  
    <audio id="myPlayer" >
        <source src="http://mainline.i3s.unice.fr/mooc/horse.ogg" type="audio/ogg" />
        <source src="http://mainline.i3s.unice.fr/mooc/horse.mp3" type="audio/mp3" />
    </audio>
    <button id="pauseButton">Pause</button>
    <button id="playButton">Play</button>
    <button onclick="player.currentTime=0;">Retour à zero</button>
    <br>
    Volume: 0 <input type="range" min=0 max=1 step=0.1 oninput="player.volume=this.value"> 1
    <br>
    <webaudio-knob id="knobVolume" tooltip="Volume:%s" src="./assets/imgs/bouton2.png" sprites="127" value=1 min="0" max="1" step=0.01>
        Volume
    </webaudio-knob>

    <webaudio-knob id="knobVolume2" tooltip="Volume:%s" src="./assets/imgs/bouton2.png" sprites="127" value=1 min="0" max="1" step=0.01>
        Volume
    </webaudio-knob>
    <webaudio-knob id="vernier" src="./assets/imgs/vernier.png" sprites="50" diameter="120" value=1 min="0" max="1" step=0.01 style="height:120px">
        Volume
    </webaudio-knob>
        `;

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.volume = 1;
    this.attachShadow({ mode: "open" });
    //this.shadowRoot.innerHTML = template;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.basePath = getBaseURL(); // url absolu du composant
    // Fix relative path in WebAudio Controls elements
		this.fixRelativeImagePaths();
  }

  // j'ai modifié
  static get observedAttributes(){
    return ["src","volume","state"];
  }
  // j'ai modifié
  attributeChangedCallback(attr, oldValue, newValue){
    console.log("attribut" + attr + "changé nouvelle valeur:" + newValue);

    if(attr === "volume"){
      this.shadowRoot.querySelector("#knobVolume").setValue(newValue, false);
      // la valeur des attribus est bien refletée par le GUI
    }
  }

  connectedCallback() {
    this.player = this.shadowRoot.querySelector("#myPlayer");
    this.player.loop = true;

    this.declareListeners();
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
  
  declareListeners() {
    this.shadowRoot.querySelector("#playButton").addEventListener("click", (event) => {
      this.play();
    });

    this.shadowRoot.querySelector("#pauseButton").addEventListener("click", (event) => {
      this.pause();
    });

    this.shadowRoot
      .querySelector("#knobVolume")
      .addEventListener("input", (event) => {
        this.setVolume(event.target.value);
      });

      this.shadowRoot
      .querySelector("#knobVolume2")
      .addEventListener("input", (event) => {
        this.setAttribute("volume",event.target.value);
        console.log("vol 2 changé")
      });


      this.shadowRoot
      .querySelector("#vernier")
      .addEventListener("input", (event) => {
        this.setVolume(event.target.value);
      });
  }

  // API
  setVolume(val) {
    this.player.volume = val;
  }

  play() {
    this.player.play();
  }

  pause() {
    this.player.pause();
  }
}

customElements.define("my-audioplayer", MyAudioPlayer);



























import './lib/webaudio-controls.js';
const getBaseURL = () => {
  const base = new URL('.', import.meta.url);
  console.log("Base = " + base);
	return `${base}`;
};

const template = document.createElement("template");
template.innerHTML = `
    <style>
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
    Volume  : 0 <input type="range" min=0 max=1 step=0.1 oninput="player.volume = this.value"/> 1
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
    <div>
    <div class="controls">
    <label>60Hz</label>
    <input type="range"
           value="0" step="1" min="-30" max="30"
         style="width:380px;"  oninput="changeGain(this.value, 0);">
    </input>
    <output id="gain0">0 dB</output>
    </div>
    <div class="controls">
    <label>170Hz  </label>
    <input type="range"
          value="0" step="1" min="-30" max="30"
          style="width:380px;" oninput="changeGain(this.value, 1);">
    </input>
    <output id="gain1">0 dB</output>
    </div>
    <div class="controls">
      <label>350Hz  </label>
      <input type="range"
           value="0" step="1" min="-30" max="30"
           style="width:380px;"  oninput="changeGain(this.value, 2);">
    </input>
      <output id="gain2">0 dB</output>
    </div>
  </div>
  </div>
  <center>
    <br/><hr/>
    <canvas id = "myCanvas" width = 500 height = 100 ></canvas>
    `;

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.volume = 1;

    this.initialization().then(async () => {
      console.log(`${this.innerTitle.innerHTML} : Bonne initialisation`)
    }) 

    this.equalizerFrequencies = [60, 170, 350, 1000, 3500, 10000]
    this.filters = []
    this.fftSizeWaveForm = 1024
    this.fftSizeFrequencies = 64

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.basePath = getBaseURL(); // url absolu du composant    <button onclick="afficheDetails()"></button>
    // Fix relative path in WebAudio Controls elements
    this.fixRelativeImagePaths();
  }

  initialization = async () => {
    this.initAudioNodes()
    this.initQuerySelectors()
    this.initAttribute().then(() =>{
      this.MyAudioPlayer.src = this.srcAttribute
    })
    try{
      this.connectedCallback().then(() =>{
        console.log(`${this.innerTitle.innerHTML} : le Noeud est monté`)
      })
    }catch(e){
      console.log('Vous avez une erreur')
    }
    this.shadowRoot.querySelector('#title').innerHTML = this.titleAttribute
    this.inEventListener()
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

    // Creates the equalizer, comprised of a set of biquad filters
    this.equalizer = audioContext.createBiquadFilter();

    // set visualizer options, for lower precision change 1024 to 512,
    // 256, 128, 64 etc. bufferLength will be equal to fftSize/2
    this.analyserNode.fftSize = 1024;
    this.bufferLength = this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    playerNode
      .connect(this.pannerNode)
      .connect(this.analyserNode)
      .connect(this.filters[0])
      .connect(audioContext.destination); // connect to the speakers

     
      for(let i = 0; i < this.filters.length - 1; i++) {
        this.filters[i].connect(this.filters[i+1]);
     }
   
     // Connects the last filter to the speakers
      this.filters[this.filters.length - 1].connect(audioContext.destination);

    this.visualize();
    this.declareListeners();
    this.equalizerFunction()
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
     //console.log(event.target.value);
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
 
  equalizerFunction(){
    this.equalizerFrequencies.forEach((fre)=>{
      let equa = this.audioContext.createBiquadFilter()
      equa = frequency.value = fre
      equa.type = 'peaking'
      equa.gain.value = 0
      this.filters.push(equa)
    })
  }

}

customElements.define("my-audioplayer", MyAudioPlayer);
