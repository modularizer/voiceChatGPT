# VoiceChatGPT
This project uses builtin javascript webkit utility to turn [ChatGPT](https://chat.openai.com/chat) into a voice assistant.

Most of the code and comments were written by ChatGPT. In fact, I was not even aware that Chrome could do speech-to-text.

## To use:

### Using Developer Console
1. navigate to [ChatGPT](https://chat.openai.com/chat)
2. Open the developer console
3. Copy-paste the content of voiceChatGPT.js into the developer console
4. talk
5. If the code is buggy, use ChatGPT to help fix the code, then pull request your changes!!

### Using a Bookmarklet
* A bookmarklet is a bookmark which runs code instead of navigating to a different page
* to make one
    * make a bookmark
    * modify the url to `javascript:<your-code-here>`
    * e.g. for this example: `javascript:(()=>{` + `content of voiceChatGPT.min.js` + `})()`
    
* Use the following as the bookmark url
```html
javascript:(()=>{class SpeechRecognition{constructor(textarea){this.recognition=new webkitSpeechRecognition;this.recognition.interimResults=true;this.speechSynthesis=window.speechSynthesis;this.observer=new MutationObserver(this.onMutation.bind(this));this.utterance=null;this.lastSpoken="";this.utterancesStarted=0;this.utterancesCompleted=0;this.onResult=this.onResult.bind(this);this.onEnd=this.onEnd.bind(this);this.onMutation=this.onMutation.bind(this);this.onBoundary=this.onBoundary.bind(this);this.onSpeechEnd=this.onSpeechEnd.bind(this);this.textarea=textarea;this.start()}onResult(event){const transcript=Array.from(event.results).map(result=>result[0]).map(result=>result.transcript).join("");this.textarea.value=transcript}onEnd(event){const submitButton=this.textarea.nextElementSibling;this.lastSpoken="";submitButton.click()}onMutation(mutations){mutations.forEach(mutation=>{if(mutation.type==="childList"){const chatbotResponse=mutation.addedNodes[0];if(chatbotResponse){this.observer.observe(chatbotResponse,{childList:true,subtree:true,characterData:true,characterDataOldValue:true})}}else if(mutation.type==="characterData"){const text=mutation.oldValue;if(text&&text!==this.lastSpoken){let t=text.replace(this.lastSpoken,"");if(!this.utterance){this.utterance=new SpeechSynthesisUtterance;this.utterance.rate=2;this.speechSynthesis.addEventListener("boundary",this.onBoundary);this.utterance.addEventListener("end",this.onSpeechEnd)}this.utterance.text+=t;this.lastSpoken=text;if(!this.speechSynthesis.pending){this.utterance.text=t;this.utterancesStarted+=1;this.speechSynthesis.speak(this.utterance)}}}})}onBoundary(event){if(event.name==="word"){let t=event.utterance.text;if(t.includes(" ")){t=t.substring(0,t.indexOf(" "))+"..."}else{t+="..."}event.utterance.text=t;console.log("Modified utterance text:",event.utterance)}}onSpeechEnd(){console.warn("speech end");this.utterancesCompleted+=1;let u=this.utterancesCompleted;setTimeout((()=>{console.warn(u,this.utterancesStarted);if(this.utterancesStarted===u){this.recognition.start()}}).bind(this),1e3)}start(){this.recognition.addEventListener("result",this.onResult);this.recognition.addEventListener("end",this.onEnd);this.recognition.start();this.observer.observe(document.body,{childList:true,subtree:true})}cancel(){speechSynthesis.cancel()}}function listen(){const textarea=document.getElementsByTagName("textarea")[0];const recognition=new SpeechRecognition(textarea);recognition.start()}listen();})()
```

* To use, navigate to https://chat.openai.com/chat then click the bookmark.
