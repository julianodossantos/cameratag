//
// CameraTag
//

if (typeof(CameraTag) == "undefined") {
  CameraTag = new function() {

    var getBrowser = function(){
      var ua= navigator.userAgent, tem,
      M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
      if(/trident/i.test(M[1])){
          tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
          return 'IE '+(tem[1] || '');
      }
      if(M[1]=== 'Chrome'){
          tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
          if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
      }
      M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
      if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
      return M
    };

    var isMobile = function() {
      if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
      ) {
        return true;
      }
      else {
        return false;
      }
    };

    var mobileUploadSupported = function () {
       // Handle devices which falsely report support
       if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
         return false;
       }
       // Create test element
       var el = document.createElement("input");
       el.type = "file";
       return !el.disabled;
    };



    var self = this;
    self.version = "8";

    var appServer = "www.cameratag.com";

    // check for mobile browser
    var mobile_browser = isMobile();
    var mobile_upload_supported = mobileUploadSupported();
    var mobile_enabled = mobile_browser && mobile_upload_supported


    // check for webrtc compatability
    var webrtc_enabled;
    if (location.protocol === 'https:' && getBrowser()[0] == "Chrome" && getBrowser()[1] >= 49) {
      webrtc_enabled = true;
    }
    else if (getBrowser()[0] == "Firefox" && getBrowser()[1] >= 40) {
      webrtc_enabled = true;
    }
    else {
      webrtc_enabled = false
    }
    
    self.cameras = {};
    self.players = {};
    self.video_walls = {};
    self.photobooths = {};
    self.captures = {};
    self.photos = {};

    self.uploader = {};


    var callbacks = {};
    var settingUp = false;
    
    var allow_play_count = true;

    if (typeof(CT_verbose_mode) == "undefined") {
      CT_verbose_mode = false;
    }

    // i18n
    if (typeof(CT_i18n) == "undefined") {
      CT_i18n = []
    }

    CT_i18n[0] = CT_i18n[0] || "To record this video using your mobile phone please visit <<url>> in your mobile browser"
    CT_i18n[1] = CT_i18n[1] || "Your mobile device does not support video uploading"
    CT_i18n[2] = CT_i18n[2] || "Recording in this browser requires Flash player 11 or higher. Would you like to install it now?"
    CT_i18n[3] = CT_i18n[3] || "Unable to embed video recorder. Please make sure you have Flash Player 11 or higher installed"
    CT_i18n[4] = CT_i18n[4] || "choose a method below to submit your video"
    CT_i18n[5] = CT_i18n[5] || "record from webcam"
    CT_i18n[6] = CT_i18n[6] || "upload a file"
    CT_i18n[7] = CT_i18n[7] || "record from phone"
    CT_i18n[8] = CT_i18n[8] || "wave to the camera"
    CT_i18n[9] = CT_i18n[9] || "recording in"
    CT_i18n[10] = CT_i18n[10] || "uploading..."
    CT_i18n[11] = CT_i18n[11] || "click to stop recording"
    CT_i18n[12] = CT_i18n[12] || "click to skip review"
    CT_i18n[13] = CT_i18n[13] || "Accept"
    CT_i18n[14] = CT_i18n[14] || "Re-record"
    CT_i18n[15] = CT_i18n[15] || "Review Recording"
    CT_i18n[16] = CT_i18n[16] || "please wait while we push pixels"
    CT_i18n[17] = CT_i18n[17] || "published"
    CT_i18n[18] = CT_i18n[18] || "Enter your <b>mobile phone number</b> below and we will text you a link for mobile recording"
    CT_i18n[19] = CT_i18n[19] || "Send Mobile Link"
    CT_i18n[20] = CT_i18n[20] || "cancel"
    CT_i18n[21] = CT_i18n[21] || "Check your phone for mobile recording instructions"
    CT_i18n[22] = CT_i18n[22] || "or point your mobile browser to"
    CT_i18n[23] = CT_i18n[23] || "drop file to upload"
    CT_i18n[24] = CT_i18n[24] || "sending your message"
    CT_i18n[25] = CT_i18n[25] || "please enter your phone number!"
    CT_i18n[26] = CT_i18n[26] || "that does not appear to be a valid phone number"
    CT_i18n[27] = CT_i18n[27] || "Unable to send SMS."
    CT_i18n[28] = CT_i18n[28] || "No Camera Detected"
    CT_i18n[29] = CT_i18n[29] || "No Microphone Detected"
    CT_i18n[30] = CT_i18n[30] || "Camera Access Denied"
    CT_i18n[31] = CT_i18n[31] || "Lost connection to server"
    CT_i18n[32] = CT_i18n[32] || "Playback failed"
    CT_i18n[33] = CT_i18n[33] || "Unable To Connect"
    CT_i18n[34] = CT_i18n[34] || "Unable to publish your recording."
    CT_i18n[35] = CT_i18n[35] || "Unable to submit form data."
    CT_i18n[36] = CT_i18n[36] || "uploading your video"
    CT_i18n[37] = CT_i18n[37] || "buffering video playback"
    CT_i18n[38] = CT_i18n[38] || "publishing"
    CT_i18n[39] = CT_i18n[39] || "connecting..."
    CT_i18n[40] = CT_i18n[40] || "negotiating firewall..."
    CT_i18n[41] = CT_i18n[41] || "Oh No! It looks like your browser paused the recorder"
    CT_i18n[42] = CT_i18n[42] || "That does not appear to be a valid video file. Proceed anyway?"
    CT_i18n[43] = CT_i18n[43] || "Record or Upload a Video"
    CT_i18n[44] = CT_i18n[44] || "Tap to get started"
    CT_i18n[45] = CT_i18n[45] || "Choose a method to submit your photo"
    CT_i18n[46] = CT_i18n[46] || "Capture from Webcam"
    CT_i18n[47] = CT_i18n[47] || "Upload a File"
    CT_i18n[48] = CT_i18n[48] || "Choose which camera and microphone you would like to use"
    CT_i18n[49] = CT_i18n[49] || "Tap here to snap or upload a photo"
    CT_i18n[50] = CT_i18n[50] || "Image Adjustments / Filters"
    CT_i18n[51] = CT_i18n[51] || "Pan & Zoom"
    CT_i18n[52] = CT_i18n[52] || "Smoke"
    CT_i18n[53] = CT_i18n[53] || "Murica"
    CT_i18n[54] = CT_i18n[54] || "Brightness / Contrast"
    CT_i18n[55] = CT_i18n[55] || "Night Vision"
    CT_i18n[56] = CT_i18n[56] || "Posterize"
    CT_i18n[57] = CT_i18n[57] || "Zinc"
    CT_i18n[58] = CT_i18n[58] || "Berry"
    CT_i18n[59] = CT_i18n[59] || "Spy Cam"
    CT_i18n[60] = CT_i18n[60] || "Magazine"
    CT_i18n[61] = CT_i18n[61] || "Cross Hatch"
    CT_i18n[62] = CT_i18n[62] || "Flare"
    CT_i18n[63] = CT_i18n[63] || "Hue / Saturation"
    CT_i18n[64] = CT_i18n[64] || "Vibrance"
    CT_i18n[65] = CT_i18n[65] || "Denoise"
    CT_i18n[66] = CT_i18n[66] || "Unsharp Mask"
    CT_i18n[67] = CT_i18n[67] || "Noise"
    CT_i18n[68] = CT_i18n[68] || "Sepia"
    CT_i18n[69] = CT_i18n[69] || "Vignette"
    CT_i18n[70] = CT_i18n[70] || "Zoom Blur"
    CT_i18n[71] = CT_i18n[71] || "Triangle Blur"
    CT_i18n[72] = CT_i18n[72] || "Tilt Shift"
    CT_i18n[73] = CT_i18n[73] || "Lens Blur"
    CT_i18n[74] = CT_i18n[74] || "Swirl"
    CT_i18n[75] = CT_i18n[75] || "Bulge / Pinch"
    CT_i18n[76] = CT_i18n[76] || "Ink"
    CT_i18n[77] = CT_i18n[77] || "Edge Work"
    CT_i18n[78] = CT_i18n[78] || "Hexagonal Pixelate"
    CT_i18n[79] = CT_i18n[79] || "Dot Screen"
    CT_i18n[80] = CT_i18n[80] || "Color Halftone"
    CT_i18n[82] = CT_i18n[82] || "Angle"
    CT_i18n[83] = CT_i18n[83] || "Size"
    CT_i18n[84] = CT_i18n[84] || "Scale"
    CT_i18n[85] = CT_i18n[85] || "Radius"
    CT_i18n[86] = CT_i18n[86] || "Strength"
    CT_i18n[87] = CT_i18n[87] || "Brightness"
    CT_i18n[88] = CT_i18n[88] || "Blur Radius"
    CT_i18n[89] = CT_i18n[89] || "Gradient Radius"
    CT_i18n[90] = CT_i18n[90] || "Hue"
    CT_i18n[91] = CT_i18n[91] || "Saturation"
    CT_i18n[92] = CT_i18n[92] || "Motion"
    CT_i18n[93] = CT_i18n[93] || "Number of Colors"
    CT_i18n[94] = CT_i18n[94] || "Gamma"
    CT_i18n[95] = CT_i18n[95] || "Color"
    CT_i18n[96] = CT_i18n[96] || "Luminance"
    CT_i18n[97] = CT_i18n[97] || "Contrast"
    CT_i18n[98] = CT_i18n[98] || "Stopping"
    CT_i18n[99] = CT_i18n[99] || "Unable to activate camera or microphone"
    CT_i18n[100] = CT_i18n[100] || "Waiting for hardware"



    self.setup = function() {
      // prevent double setup
      if (settingUp) {
        raise("setup() called while CameraTag already setting up. Try again later");
        return;
      }
      settingUp = true;

      // create instances for each camera tag in the page
      instantiateCameras();      

      // create instances for each video tag in the page
      instantiatePlayers();

      // create instances for each video tag in the page
      instantiateVideoWalls();

      // create instances for each video tag in the page
      instantiatePhotoBooths();

      // create instances for each video tag in the page
      instantiateScreenCaptures();

      // create instances for each video tag in the page
      instantiatePhotos();

      settingUp = false;
    }

    var get_camera = function(camera_uuid, callback) {
      $.ajax({
        url: "//"+appServer+"/api/v"+CameraTag.version+"/cameras/"+camera_uuid+"/new_video.json",
        type:"get",
        success: function(response) {
          if (response.camera != undefined) {
            // build response
            callback({
              success: true,
              camera: response.camera,
              videoServer: response.videoServer
            });
          }
          else {
            callback({ success: false, message: response.message });
          }
        },

        error: function(jqXHR, textStatus, errorThrown) {
          callback({ 
            success: false, 
            message: "error initializing recorder",
            jqXHR: jqXHR,
            textStatus: textStatus,
            errorThrown: errorThrown
          });
        }
      });
    }

    var generateUUID = function(prefix){
        var d = new Date().getTime();
        var uuid = prefix+'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    var instantiateCameras = function() {
      $("camera:not([type='photo'])").each(function(index, camera_el) {
        new CameraTagVideoCamera(camera_el);
      });
    };

    var instantiatePlayers = function() {
      $("video").each(function(index, video_el){
        if ($(video_el).attr("data-uuid") || $(video_el).attr("data-video-id")) {
          new CameraTagVideo(video_el);
        }
      });
    };

    var instantiateVideoWalls = function() {
      $("videowall").each(function(index, wall_el){
        if ($(wall_el).attr("data-app-id")) {
          new CameraTagVideoWall(wall_el);
        }
      });
    };

    var instantiatePhotoBooths = function() {
      $("photobooth").each(function(index, booth_el){
        if ($(booth_el).attr("data-app-id")) {
          new CameraTagPhotoCamera(booth_el);
        }
      });
    };

    var instantiateScreenCaptures = function() {
      $("capture").each(function(index, capture_el){
        if ($(capture_el).attr("data-app-id")) {
          new CameraTagScreenCapture(capture_el);
        }
      });
    };

    var instantiatePhotos = function() {
      $("photo[data-uuid]").each(function(index, photo_el){
        if ($(photo_el).attr("data-uuid")) {
          new CameraTagPhoto(photo_el);
        }
      });
    };

    // EVENT OBSERVATION
    self.observe = function(camera_dom_id,event_name,callback,priority) {
      priority = priority || false;
      if ( !callbacks[camera_dom_id] )
        callbacks[camera_dom_id] = {};
      if ( !callbacks[camera_dom_id][event_name] )
        callbacks[camera_dom_id][event_name] = [];

      if (priority) {
        callbacks[camera_dom_id][event_name].splice(0,0,callback);
      }
      else {
        callbacks[camera_dom_id][event_name].push(callback);  
      }
    };

    self.fire = function(camera_dom_id,event_name,data) {
      if ( !callbacks[camera_dom_id] )
        callbacks[camera_dom_id] = {};
      if ( !callbacks[camera_dom_id][event_name] )
        callbacks[camera_dom_id][event_name] = [];
      
      setTimeout(function(){
        fire_handlers(camera_dom_id,event_name,data);
      }, 1);
    };

    var fire_handlers = function(camera_dom_id,event_name,data) {
      for( i = 0; i < callbacks[camera_dom_id][event_name].length; i++ ) {
        try {
          callbacks[camera_dom_id][event_name][i](data);
        }
        catch(err) {}
      }
    }

    self.stopObserving = function(camera_dom_id,event_name,callback) {
      if ( !callbacks[camera_dom_id] )
        callbacks[camera_dom_id] = {};
      if ( !callbacks[camera_dom_id][event_name] )
        callbacks[camera_dom_id][event_name] = [];
      

      for( i = 0; i < callbacks[camera_dom_id][event_name].length; i++ ) {
        if( callbacks[camera_dom_id][event_name][i] == callback )
          callbacks[camera_dom_id][event_name].splice(i,1);
      }
    };

    var publish_asset = function(options) {
      //camera_uuid, asset_uuid, type, videoServer, signature, signature_expiration, video_data_object, video_name, video_description, asset_type
      $.ajax({
        url: "//"+appServer+"/api/v"+CameraTag.version+"/cameras/"+options["camera_uuid"]+"/assets/"+options["asset_uuid"]+"/publish.json",
        type:"post",
        data: {
          asset_type: options["asset_type"],
          publish_type: options["type"], 
          server: options["videoServer"],
          referer: window.location.toString(),
          version: self.version,
          signature: options["signature"],
          signature_expiration: options["signature_expiration"],
          metadata: JSON.stringify(options["metadata"]),
          asset_name: options["asset_name"],
          asset_description: options["asset_description"]
        },
        success: function(response) {
          if (response["uuid"]) {
            self.fire(options["asset_uuid"], "published", response);
          }
          else {
            self.fire(options["asset_uuid"], "publishFailed", {success: false, video_uuid: options["asset_uuid"], message: response});
          }
        },
        error: function() {
          self.fire(options["asset_uuid"], "publishFailed", {success: false, video_uuid: options["asset_uuid"], message: "unkown error"});
        }
      })
    };

    self.prototype = self; // legacy support



    // Included Products
    var CameraTagVideoCamera = function(camera_el) {
  // main data objects
  var cachebuster = parseInt( Math.random() * 100000000 );
  var self = this;
  var this_recorder = this;
  var camera_uuid = $(camera_el).attr("data-uuid") || $(camera_el).attr("data-app-id") || $(camera_el).attr("id");
  var signature = $(camera_el).attr("data-signature");
  var signature_expiration = $(camera_el).attr("data-signature-expiration");
  var video_name = $(camera_el).attr("data-video-name");
  var video_description = $(camera_el).attr("data-video-description");
  var metadata = $(camera_el).attr("data-metadata") || $(camera_el).attr("data-video-data");
  var permitted_extensions = ["mov", "mp4", "webm", "flv", "mv4", "mov", "avi", "wmv", "mpeg", "mpg"];
  var metadata_object;

  try {
     metadata_object = JSON.parse(metadata);
  }
  catch (e) {
    if (metadata != undefined) {
      console.warn("Could not parse metadata JSON from <camera> attribute."); 
    }
  }
  
  var camera = {};
  var video = {};
  var dom_id = $(camera_el).attr("id") || cachebuster;
  var uploader;
  var txt_message;
  var input_name;
  var record_timer;
  var paused_timer;
  var record_timer_count = 0;
  var record_timer_prompt = 0;
  var existing_uuid = $(camera_el).attr("data-video-uuid");
  var processed_timer;
  var published_timer;

  // overwritable params
  var sources;
  var fps;
  var className;
  var videoServer; // gets set by server in auth callback
  var height;
  var width;
  var hResolution;
  var vResolution;
  var maxLength;
  var minLength;
  var skipPreview;
  var skipFontAwesome;
  var videoBitRate;
  var skipAutoDetect;
  var simpleSecurity;
  var preRollLength;
  var recordOnConnect;
  var publishOnUpload;
  var uploadOnSelect;
  var flipRecordPreview;
  var poll_processed;
  var font_size;
  var default_sms_country;
  var swf_check_count;
  var frameInterval;
  // var audioSampleRate;
  var bufferSize;
  var inline_styles;


  // DOM references
  var container;
  var recorder;
  var start_screen;
  var settings_screen;
  var settings_btn
  var mobile_start_screen;
  var paused_screen;
  var playback_screen;
  var recording_screen;
  var camera_detection_screen;
  var countdown_screen;
  var countdown_status;
  var upload_screen;
  var upload_status;
  var accept_screen;
  var wait_screen;
  var wait_message;
  var completed_screen;
  var error_screen;
  var error_message;
  var sms_screen;
  var sms_input;
  var thumb_bg;
  var check_phone_screen;
  var alternative_prompt;

  // Control functions
  self.connect = function(){};
  self.play = function(){};
  self.record = function(){};
  self.stopRecording = function(){};
  self.stopPlayback = function(){};
  self.showFlashSettings = function(){};
  self.getFrame = function(){};
  
  // state management 
  var state;
  var current_screen;
  var paused = false;
  var connected = false;
  var readyToRecord = false;
  var countdown_counter = 0;
  var uploading = false;
  var error_messages = [];
  var readyToPublish = false;
  var initialized = false;
  var publishType = "webcam";
  var file_to_upload;

  // keep a reference to this instance in the Class prototype
  CameraTag.cameras[dom_id] = self;

  var setup = function() {    
    // get permission for a new video
    get_camera(camera_uuid, function(server_response){
      if (server_response.success) {
        camera = server_response.camera;
        videoServer = server_response.videoServer;
        video = new_video();
        
        // observe new video for its published state
        CameraTag.observe(video.uuid, "published", function(published_video) {
          if (video.uuid == published_video.uuid) {
            state = "published";
            populate_hidden_inputs();
            //sendStat("publish_success");
            CameraTag.fire(dom_id, "published", video);  
            if (poll_processed) {
              pollForProcessed();
            }
            self.loadInterface(completed_screen);
            if (connected) {
              self.disconnect();
            }
          }
        }, true);

        // failed publish
        CameraTag.observe(video.uuid, "publishFailed", function(error) {
          if (video.uuid == error.video_uuid) {
            throw_error(CT_i18n[34] + error.message);
          }
        }, true);
      }
      else {
        error_messages.push(server_response.message);
        CameraTag.fire(dom_id, "initializationError", server_response);
      }

      // initialize the interface
      setup_interface();

      if (error_messages.length > 0) {
        throw_error(error_messages[0]);
        return;
      }


      CameraTag.observe(dom_id, "initialized", function(){
        // load up the start screen 
        if (mobile_enabled) {
          self.loadInterface(mobile_start_screen, true);  
        } else {
          self.loadInterface(start_screen, true);  
        }

        // show settings button if applicable
        if (recorder.listCameras().length > 0) {
          settings_btn.show();
        }
      })
      

      // font-size
      font_size = parseInt($(container).height() / 14);
      if (font_size < 12) {
        font_size = 12;
      }
      $(container).css({fontSize: font_size+"px"});  

    });
  };

  var new_video = function() {
    var vid = {};
    if (existing_uuid) {
      vid.uuid = existing_uuid  
    } else {
      vid.uuid = generateUUID("v-");  
    }
    
    // setup video formats
    vid.formats = {};
    if (camera.formats) {
      $(camera.formats).each(function(index, format){
        vid.formats[format.name] = {};
      })
    }
    
    return vid;
  }

  var setup_interface = function() {
    // setup prarms with preference to passed in as data attributes on the camera tag
    input_name = $(camera_el).attr("name") || dom_id;
    inline_styles = $(camera_el).attr("style");
    className = $(camera_el).attr("class") || camera.className || "";
    fps = camera.formats && camera.formats[0].fps || 24;
    if (camera.formats && webrtc_enabled) {
      width = camera.formats[0].height < 360 ? camera.formats[0].width : camera.formats[0].width / 2;
      height = camera.formats[0].height < 360 ? camera.formats[0].height : camera.formats[0].height / 2;
      hResolution = camera.formats[0].width > 640 ? 896 : camera.formats[0].width;
      vResolution = camera.formats[0].width > 640 ? 504 : camera.formats[0].height;
    }
    else if (camera.formats) {
      width = camera.formats[0].height <= 360 ? camera.formats[0].width : camera.formats[0].width / 2;
      height = camera.formats[0].height <= 360 ? camera.formats[0].height : camera.formats[0].height / 2;
      hResolution = camera.formats[0].width;
      vResolution = camera.formats[0].height;
    } else {
      // this is used to define an area to display an error
      width = 300;
      height = 200;
      hResolution = 300;
      vResolution = 200;
    }

    sources = $(camera_el).attr("data-sources") || "record,upload,sms";
    sources = sources.replace(" ", "").split(",");
    maxLength = $(camera_el).attr("data-maxlength") || $(camera_el).attr("data-max-length") || 30;
    minLength = $(camera_el).attr("data-minlength") || $(camera_el).attr("data-min-length") || 3;
    videoBitRate = $(camera_el).attr("data-videobitrate");
    if (camera) {
      videoBitRate = videoBitRate || camera.video_bitrate;
    }
    CT_i18n[0] = $(camera_el).attr("data-txt-message") || CT_i18n[0];
    autoPreview = $(camera_el).attr("data-autopreview") == "true"
    skipPreview = !autoPreview;
    publishOnUpload = $(camera_el).attr("data-publish-on-upload") != "false";
    skipFontAwesome = $(camera_el).attr("data-skip-font-awesome") == "true";
    uploadOnSelect = $(camera_el).attr("data-upload-on-select") != "false";
    recordOnConnect = $(camera_el).attr("data-record-on-connect") != "false";
    skipAutoDetect = $(camera_el).attr("data-skip-auto-detect") != "false" || $(camera_el).attr("data-detect-camera") == "true";
    simpleSecurity = $(camera_el).attr("data-simple-security") == "true";
    flipRecordPreview = $(camera_el).attr("data-mirror-recording") != "false";
    poll_processed = $(camera_el).attr("data-poll-for-processed") == "true";
    webrtc_enabled = ($(camera_el).attr("data-webrtc") == "false") ? false : webrtc_enabled;
    publishType = webrtc_enabled ? "mediarecorder" : "webcam";
    default_sms_country = $(camera_el).attr("data-default-sms-country");
    frameInterval = $(camera_el).attr("data-frame-interval") || 41;
    //audioSampleRate = $(camera_el).attr("data-audio-sample-rate") || 44100;
    bufferSize = $(camera_el).attr("data-buffer-size") || 16384;

    if ($(camera_el).attr("data-pre-roll-length")) {
      preRollLength = parseInt($(camera_el).attr("data-pre-roll-length"))
    }
    else {
      preRollLength = 5;
    }
    

    // build the control elements  
    createUploader();
    buildInterface();
    setupEventObservers();  

    // check for non-compatible mobile device
    if (mobile_browser && !mobile_enabled) {
      error_messages.push(CT_i18n[1]);
      CameraTag.fire(dom_id, "unsupportedDevice");
    }

    // show error messages if there are any
    if (error_messages.length > 0) {
      throw_error(error_messages.join("\n"));
      return;
    }

    // initialize if we dont have a recorder
    if (mobile_browser || sources.indexOf("record") == -1) {
      CameraTag.fire(dom_id, "initialized");  
    }
  };

  var embedRecordingStack = function() {
    if (webrtc_enabled && typeof(navigator.getUserMedia) == "function") {
      recorder = new WebRTCRecorder();
    }
    else if (!mobile_enabled) {
      embedSWF();
    }
  }

  var embedSWF = function() {
    var flashvars = {
        videoServer: videoServer,
        videoUUID: video.uuid,
        cameraUUID: camera.uuid,
        domID: dom_id,
        maxLength: maxLength,
        hResolution: hResolution,
        vResolution: vResolution,
        fps: fps,
        videoBitRate: videoBitRate,
        skipAutoDetect: skipAutoDetect,
        flipRecordPreview: flipRecordPreview,
        simpleSecurity: simpleSecurity,
        verboseMode: CT_verbose_mode
    };

    var params = {
        allowfullscreen: 'true',
        allowscriptaccess: 'always',
        wmode: "transparent"
    };

    var attributes = {
        id: dom_id+"_swf",
        name: dom_id+"_swf"
    };

    swfobject.embedSWF("//"+appServer+"/static/"+CameraTag.version+"/camera.swf?"+cachebuster, dom_id+"_recorder_placeholder", "100%", "100%", '11.1.0', 'https://'+appServer+'/static/'+CameraTag.version+'/expressInstall.swf', flashvars, params, attributes, checkSWF);

    if (swfobject.getFlashPlayerVersion().major < 11) {
      CameraTag.fire(dom_id, "unsupportedFlashVersion", {version: swfobject.getFlashPlayerVersion().major});
      CameraTag.fire(dom_id, "initialized");      
    }

  };

  var checkSWF = function(){
    recorder = document[dom_id+"_swf"];
    if (typeof(recorder) == "undefined" && swf_check_count < 5) {
      swf_check_count += 1;
      setTimeout(checkSWF,200);
    } else if (swf_check_count >= 5) {
      CameraTag.fire(dom_id, "flashInitializationError");
    }
  }

  self.remove = function() {
    clearTimeout(processed_timer);
    clearTimeout(published_timer);
    clearInterval(record_timer);
    countdown_counter = 0;
    record_timer_count = 0;
    uploading = false;
    error_messages = [];
    readyToPublish = false;
    if (connected) {
      self.disconnect();  
    }
    self.uploader.destroy();
    container.remove();
    delete CameraTag.cameras[dom_id];
    delete callbacks[dom_id];
  }

  self.getState = function() {
    return state;
  };

  self.startUpload = function() {
    // get file extension
    var ext = file_to_upload.name.split(".")
    ext = ext[ext.length-1];
    ext = ext.toLowerCase();

    // dont permit invalid filetypes
    if (permitted_extensions.indexOf(ext) == -1) {
      if ( !confirm(CT_i18n[42]) ) {
        return;
      }
    }

    // state = "uploading";
    // uploading = true; // andorid doesn't seem to get this set through the uploadStarted event?
    CameraTag.fire(dom_id, "uploadStarted");
    // upload_screen.show();
    // // start_screen.hide();
    // start_screen.css("left", "-10000px");
    // start_screen.css("right", "10000px");

    var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1; //&& ua.indexOf("mobile");
    if (isAndroid) {
      upload_status.html("...");
    }
    else {
      upload_status.html("0%");
    }
    
    uploader.add({
      name: 'recordings/' + video.uuid + '.flv',
      file: file_to_upload,
      notSignedHeadersAtInitiate: {
         'Cache-Control': 'max-age=3600'
      },
      xAmzHeadersAtInitiate : {
         'x-amz-acl': 'public-read'
      },
      signParams: {},
      complete: function(){
        readyToPublish = true;
        publishType = "upload";
        CameraTag.fire(dom_id, "readyToPublish");
        //sendStat("upload_success", {});

        start_screen.css("left", "0px");
        start_screen.css("right", "0px");

        if (publishOnUpload) {
         wait(CT_i18n[38]);
         upload_and_publish(camera.uuid, video.uuid, "upload", videoServer, signature, signature_expiration, metadata_object, video_name, video_description); // publish without s3  
        }
        else {
         // wait for manual publish command
        }
      },
      progress: function(progress){
        CameraTag.fire(dom_id, "UploadProgress", progress);
        CameraTag.fire(dom_id, "uploadProgress", progress);
        upload_status.html((progress * 100).toFixed(1) + "%");
      }
    });
  }

  var createUploader = function() {
    uploader = new Evaporate({
       signerUrl: '//'+appServer+'/api/v'+CameraTag.version+'/videos/upload_signature',
       aws_key: 'AKIAJCHWZMZ35EB62V2A',
       bucket: 'assets.cameratag.com',
       aws_url: 'https://d2az0z6s4nrieh.cloudfront.net',
       cloudfront: true,
       logging: false
    });

    self.uploader = uploader;

    // dont allow upload source if uploader not supported
    if (!uploader.supported) {
      var upload_source_index = sources.indexOf("upload");
      if (upload_source_index != -1) {
        sources.splice(upload_source_index,1);
      }
    }
  }

  var buildSettingsDialog = function() {
    if (recorder.listCameras().length > 0) {
      var camera_options = $('<select class="cameratag_cam_select"></select>');
      var mic_options = $('<select class="cameratag_mic_select"></select>');
      var prompt = $('<div class="cameratag_select_prompt">'+CT_i18n[48]+'</div>');

      $(recorder.listCameras()).each(function(index, device){
        var option = $('<option value="'+device.deviceId+'">'+device.label+'</option>')
        camera_options.append(option);
      })
      $(recorder.listMicrophones()).each(function(index, device){
        var option = $('<option value="'+device.deviceId+'">'+device.label+'</option>')
        mic_options.append(option);
      });
      var close_btn = $('<div class="cameratag_save">Save</div>');

      camera_options.change(function(){
        recorder.setCamera( $(this).val() );
      });
      mic_options.change(function(){
        recorder.setMicrophone( $(this).val() );
      });
      close_btn.click(function(){
        self.loadInterface(start_screen);
      });

      settings_screen.append(prompt).append(camera_options).append("<br/>").append(mic_options).append("<br/>").append(close_btn);
    }
  }

  var buildInterface = function() {

    if (!skipFontAwesome) {
      var font_awesome = $('<link href="//netdna.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.css" media="all" rel="stylesheet" type="text/css" />');
      $("head").append(font_awesome);
    }
    
    // container and swf
    container = $('<div id="'+dom_id+'" class="camera_tag"></div>');
    container.css({width: width+"px", height: height+"px"})
    container.attr("style", inline_styles);
    container.addClass(className);
    $(camera_el).replaceWith(container);
    if (!mobile_browser && sources.indexOf("record") != -1) {
      // create swf placeholder in container then embed the camera swf
      container.append("<div id='"+dom_id+"_recorder_placeholder'></div>")

      // recorder API (swf or WebRTC)
      embedRecordingStack();

      // communication to and from swf
      setupExternalInterface();
    }

    // settings screen
    if (sources.indexOf("record") != -1) {
      settings_screen = $("#"+dom_id+"-settings-screen").addClass("cameratag_screen");
      if (settings_screen.length == 0) {
        settings_screen = $('<div id="'+dom_id+'_settings_screen" class="cameratag_screen cameratag_setings"></div>');
        // this gets populated at initialization
      }
    }
    container.append(settings_screen);
    

    // start screen
    start_screen = $("#"+dom_id+"-start-screen").addClass("cameratag_screen");
    if (start_screen.length == 0) {
      start_screen = $('<div id="'+dom_id+'_start_screen" class="cameratag_screen cameratag_start"></div>');
      
      var selection_prompt = $('<a class="cameratag_select_prompt">'+CT_i18n[4]+'</a>');
      start_screen.append(selection_prompt);

      if (sources.indexOf("record") != -1) {
        var record_btn = $('<a class="cameratag_primary_link cameratag_record_link cameratag_record"><span class="cameratag_action_icon">&#61501;</span><br><span class="cameratag_prompt_label">'+CT_i18n[5]+'</span></a>');
        start_screen.append(record_btn);
      }
      
      if (sources.indexOf("upload") != -1) {
        var upload_btn = $('<a id="'+dom_id+'_upload_link" class="cameratag_primary_link cameratag_upload_link cameratag_upload"><span class="cameratag_action_icon">&#61678;</span><br><span class="cameratag_prompt_label">'+CT_i18n[6]+'</span></a>');
        start_screen.append(upload_btn);
      } 

      if (sources.indexOf("sms") != -1) {
        var sms_btn = $('<a class="cameratag_primary_link cameratag_sms_link"><span class="cameratag_action_icon">&#61707;</span><br><span class="cameratag_prompt_label">'+CT_i18n[7]+'</span></a>');
        start_screen.append(sms_btn);
      }
      
      settings_btn = $('<img class="cameratag_settings_btn" src="//cameratag.com/assets/gear.png" style="display:none">');
      start_screen.append(settings_btn);  
    }
    // add to DOM
    container.append(start_screen);
    // check position
    $(start_screen).css("position", "absolute");


    // mobile start screen
    mobile_start_screen = $("#"+dom_id+"-mobile-start-screen").addClass("cameratag_screen");
    if (mobile_start_screen.length == 0) {
      mobile_start_screen = $('<div id="'+dom_id+'_mobile_start_screen" class="cameratag_screen cameratag_mobile_start"></div>');
      
      var selection_prompt = $('<a class="cameratag_mobile_prompt">'+CT_i18n[43]+'</a>');
      mobile_start_screen.append(selection_prompt);

      var sms_btn = $('<a class="cameratag_primary_link cameratag_sms_link"><span class="cameratag_action_icon">&#61707;</span><br><span class="cameratag_prompt_label">'+CT_i18n[44]+'</span></a>');
      mobile_start_screen.append(sms_btn);
    }
    // add to DOM
    container.append(mobile_start_screen);


    // error screen
    error_screen = $("#"+dom_id+"-error-screen").addClass("cameratag_screen");
    if (error_screen.length == 0) {
      error_screen = $('<div class="cameratag_screen cameratag_error"></div>');
      error_message = $('<div class="cameratag_error_message"></div>');
      error_screen.append(error_message);
      var error_settings_btn = $('<img class="cameratag_settings_btn" src="//cameratag.com/assets/gear.png">');
      error_screen.append(error_settings_btn);
    } else {
      error_message = $(".cameratag_error_message");
    }
    // add to DOM
    container.append(error_screen);

    // camera detection
    camera_detection_screen = $("#"+dom_id+"-camera-detection-screen").addClass("cameratag_screen");
    if (camera_detection_screen.length == 0) {
      // legacy support for old typo
      camera_detection_screen = $("#"+dom_id+"camera-detection-screen").addClass("cameratag_screen");
    }
    if (camera_detection_screen.length == 0) {
      camera_detection_screen = $('<div class="cameratag_screen cameratag_detect"></div>');
      var camera_detection_prompt = $('<div class="cameratag_prompt">'+CT_i18n[8]+'</div>');
      camera_detection_screen.append(camera_detection_prompt);
    }
    // add to DOM
    container.append(camera_detection_screen);


    // countdown
    countdown_screen = $("#"+dom_id+"-countdown-screen").addClass("cameratag_screen");
    countdown_status = countdown_screen.find(".cameratag_countdown_status");
    if (countdown_screen.length == 0) {
      countdown_screen = $('<div class="cameratag_screen cameratag_count"></div>');
      var countdown_prompt = $('<div class="cameratag_prompt">'+CT_i18n[9]+' </div>');
      countdown_status = $('<div class="cameratag_countdown_status"></div>');
      countdown_screen.append(countdown_status);
      countdown_screen.append(countdown_prompt);
    }
    // add to DOM
    container.append(countdown_screen);


    // paused screen
    paused_screen = $("#"+dom_id+"-pause-screen")
    if (paused_screen.length == 0) {
      paused_screen = $('<div class="cameratag_paused"></div>');
      var paused_msg = $('<div class="cameratag_paused_message">'+CT_i18n[41]+'</div>')
    }
    // add to DOM
    paused_screen.append(paused_msg);
    container.append(paused_screen);


    // upload
    upload_screen = $("#"+dom_id+"-upload-screen").addClass("cameratag_screen");
    upload_status = upload_screen.find(".cameratag_upload_status");
    if (upload_screen.length == 0) {
      upload_screen = $('<div class="cameratag_screen cameratag_upload"></div>');
      var upload_prompt = $('<div class="cameratag_prompt">'+CT_i18n[10]+'</div>');
      upload_status = $('<div class="cameratag_upload_status"></div>');
      upload_screen.append(upload_status);
      upload_screen.append(upload_prompt);
    }
    // add to DOM
    container.append(upload_screen);


    // record controls
    recording_screen = $("#"+dom_id+"-recording-screen").addClass("cameratag_screen");
    record_timer_prompt = recording_screen.find(".cameratag_record_timer_prompt");
    if (recording_screen.length == 0) {
      recording_screen = $('<div class="cameratag_screen cameratag_recording cameratag_stop_recording"></div>');
      var stop_prompt = $('<div class="cameratag_prompt">'+CT_i18n[11]+'</div>');
      record_timer_prompt = $('<span class="cameratag_record_timer_prompt"> ('+ formatted_seconds(maxLength)+')</span>');
      var recording_indicator = $('<img src="//'+appServer+'/assets/recording.gif"/>');
      stop_prompt.append(record_timer_prompt);
      recording_screen.append(stop_prompt);
      recording_screen.append(recording_indicator);
    }
    // add to DOM
    container.append(recording_screen);
  
  
    // play controls
    playback_screen = $("#"+dom_id+"-playback-screen").addClass("cameratag_screen");
    if (playback_screen.length == 0) {
      playback_screen = $('<div class="cameratag_screen cameratag_playback cameratag_stop_playback"></div>');
      var skip_prompt = $('<div class="cameratag_prompt">'+CT_i18n[12]+'</div>');
      playback_screen.append(skip_prompt);  
    }
    // add to DOM
    container.append(playback_screen);
    

    // accept controls
    accept_screen = $("#"+dom_id+"-accept-screen").addClass("cameratag_screen");
    if (accept_screen.length == 0) {
      accept_screen = $('<div class="cameratag_screen cameratag_accept"></div>');
      var accept_btn = $('<a class="cameratag_accept_btn cameratag_publish"><span class="button_label">&#10003; '+CT_i18n[13]+'</span></a>');
      var rerecord_btn = $('<a class="cameratag_rerecord_btn cameratag_record"><span class="button_label">&#9851; '+CT_i18n[14]+'</span></a>');
      var play_btn = $('<a class="cameratag_play_btn cameratag_play"><span class="button_label">&#8629; '+CT_i18n[15]+'</span></a>');
      accept_screen.append(accept_btn);
      accept_screen.append(rerecord_btn);
      accept_screen.append(play_btn);
    }
    // add to DOM
    container.append(accept_screen);
    

    // wait screen
    wait_screen = $("#"+dom_id+"-wait-screen").addClass("cameratag_screen");
    wait_message = wait_screen.find(".cameratag_wait_message");
    if (wait_screen.length == 0) {
      wait_screen = $('<div class="cameratag_screen cameratag_wait"></div>');
      var spinner = $('<div class="cameratag_spinner"><img src="//'+appServer+'/assets/loading.gif"/><br/><span class="cameratag_wait_message">'+CT_i18n[16]+'</span></div>');
      wait_screen.append(spinner);
      wait_message = wait_screen.find(".cameratag_wait_message");
    }
    // add to DOM
    container.append(wait_screen);


    // completed screen
    completed_screen = $("#"+dom_id+"-completed-screen").addClass("cameratag_screen");
    if (completed_screen.length == 0) {
      completed_screen = $('<div class="cameratag_screen cameratag_completed"></div>');
      thumb_bg = $('<div class="cameratag_thumb_bg"></div>');
      var check_mrk = $('<div class="cameratag_checkmark"><span class="check">&#10004;</span> '+CT_i18n[17]+'</div>');
      completed_screen.append(thumb_bg);
      completed_screen.append(check_mrk);

    }
    // add to DOM
    container.append(completed_screen);


    // sms screen
    sms_screen = $("#"+dom_id+"-sms-screen").addClass("cameratag_screen");
    sms_input = sms_screen.find(".cameratag_sms_input");
    if (sms_screen.length == 0) {
      sms_screen = $('<div class="cameratag_screen cameratag_sms"></div>');
      var sms_input_prompt = $('<div class="cameratag_sms_prompt">'+CT_i18n[18]+'<br/></div>');
      sms_input = $('<input id="'+dom_id+'_sms_input" class="cameratag_sms_input" type="text"/>');
      var sms_submit = $('<br/><a href="javascript:" class="cameratag_send_sms">'+CT_i18n[19]+'</a>&nbsp;&nbsp;<a href="javascript:" class="cameratag_goto_start">'+CT_i18n[20]+'</a>');

      sms_input_prompt.append(sms_input);
      sms_input_prompt.append(sms_submit);
      sms_screen.append(sms_input_prompt);
      $(sms_input).intlTelInput({
        defaultCountry: default_sms_country
      });
    }
    // add to DOM
    container.append(sms_screen);


    // check phone screen
    check_phone_screen = $("#"+dom_id+"-check-phone-screen").addClass("cameratag_screen");
    if (check_phone_screen.length == 0) {
      check_phone_screen = $('<div class="cameratag_screen cameratag_check_phone"><div class="cameratag_check_phone_prompt">'+CT_i18n[21]+'</div><div class="cameratag_check_phone_url">'+CT_i18n[22]+' http://'+appServer+'/api/v'+CameraTag.version+'/cameras/'+camera.uuid+'/videos/'+video.uuid+'/mobile_record</div></div>');
    }
    // add to DOM
    container.append(check_phone_screen);
    

    // hidden inputs
    container.append("<input id='"+input_name+"_video_uuid' type='hidden' name='"+input_name+"[video_uuid]' value=''>");
    $(camera.formats).each(function(index, format){
      container.append("<input id='"+input_name+"_"+format.name+"_video' type='hidden' name='"+input_name+"["+format.name+"][video]' value=''>");
      container.append("<input id='"+input_name+"_"+format.name+"_mp4' type='hidden' name='"+input_name+"["+format.name+"][mp4]' value=''>");
      container.append("<input id='"+input_name+"_"+format.name+"_webm' type='hidden' name='"+input_name+"["+format.name+"][webm]' value=''>");
      container.append("<input id='"+input_name+"_"+format.name+"_thumb' type='hidden' name='"+input_name+"["+format.name+"][thumb]' value=''>");
      container.append("<input id='"+input_name+"_"+format.name+"_small_thumb' type='hidden' name='"+input_name+"["+format.name+"][small_thumb]' value=''>");
    });


    //
    // SETUP ACTION CLASS OBSERVERS
    //

    // UPLOADING
    if (mobile_enabled) {
      create_uploader(mobile_start_screen);    
    }
    else if (start_screen.find(".cameratag_upload").length > 0) {
      create_uploader( start_screen.find(".cameratag_upload")[0] );
    }

    // CLICKING
    if (!mobile_browser) {
      container.find(".cameratag_record").click(function(){self.record()});
      container.find(".cameratag_stop_recording").click(function(){self.stopRecording()});
      container.find(".cameratag_stop_playback").click(function(){self.stopPlayback()});
      container.find(".cameratag_play").click(function(){self.play()});
      container.find(".cameratag_publish").click(function(){self.publish()});
      container.find(".cameratag_goto_start").click(function(){self.loadInterface(start_screen, true);});  
      container.find(".cameratag_send_sms").click(function(){self.send_sms();});
      container.find(".cameratag_sms_link").click(function(){self.loadInterface(sms_screen);});
      container.find(".cameratag_settings_btn").click(function(e){
        e.stopPropagation();
        self.inputSettings()
      });  
    }
  };

  self.inputSettings = function() {
    self.loadInterface(settings_screen);
  }

  var countdown = function(length, callback) {
    if (paused) {
      container.find(".cameratag_screen").hide();
      setTimeout(function(){
        countdown(length, callback);
      }, 1000);
    }
    else {
      self.loadInterface(countdown_screen);
      if (countdown_counter >= length) {
        countdown_counter = 0;
        countdown_screen.hide();
        callback();
        CameraTag.fire(dom_id, "countdownFinished");
      }
      else {
        countdown_status.html(length - countdown_counter);
        countdown_counter += 1;
        setTimeout(function(){
          countdown(length, callback);
        }, 1000);
      }  
    }
  };

  self.loadInterface = function(state_container, alternatives, message) {
    current_screen = state_container;
    container.find(".cameratag_screen").hide();

    if (state_container != "none") {
      state_container.css('display','block');
    }
  };

  var formatted_seconds = function(s) {
    var minutes = Math.floor(s / 60);
    var seconds  = s - (minutes * 60);
    if (minutes > 0) {
      if (seconds < 10) {
        return minutes + ":0" + seconds;
      } else {
        return minutes + ":" + seconds;
      }  
    } else {
      return seconds
    }
    
  }

  var recordTimerTick = function() {
    record_timer_count += 1;
    var time_left = maxLength - record_timer_count;
    record_timer_prompt.html( " (" + formatted_seconds(time_left) + ")" );
    if (time_left == 0) {
      CameraTag.fire(dom_id, "recordingTimeOut");
      clearInterval(record_timer);
      self.stopRecording();
    }
  }

  var upload_and_publish = function(camera_uuid, video_uuid, type, videoServer, signature, signature_expiration, metadata_object, video_name, video_description) {
    if (type == "mediarecorder") {
      // this will auto call publish_asset on complete
      uploadRTC();
    }
    else {
      publish_asset({
        camera_uuid: camera_uuid, 
        asset_uuid: video_uuid, 
        asset_type: "Video",
        type: type, 
        videoServer: videoServer, 
        signature: signature, 
        signature_expiration: signature_expiration, 
        metadata: metadata_object, 
        asset_name: video_name, 
        asset_description: video_description
      });
    }
  };

  var throw_error = function(message) {
    error_message.html(message);
    self.loadInterface(error_screen, true);
  };

  self.publish = function() {
    if (!readyToPublish) {
      //sendStat("premature_publish");
      throw("Camera not ready to publish. Please wait for the 'readyToPublish' event.");
      return;
    }

    CameraTag.fire(dom_id, "publishing");
    wait(CT_i18n[38]);
    upload_and_publish(camera.uuid, video.uuid, publishType, videoServer, signature, signature_expiration, metadata_object, video_name, video_description);
  }

  var wait = function(message) {
    message = message || "please wait";
    wait_message.html(message);
    self.loadInterface(wait_screen);
  }

  var populate_hidden_inputs = function() {
    $("#"+input_name+"_video_uuid").val(video.uuid);
    $(camera.formats).each(function(index, format){
      // videos
      var mp4_url = "//"+appServer+"/downloads/"+video.uuid+"/"+format.name+"/mp4.mp4";
      if (camera.create_webm) {
        var webm_url = "//"+appServer+"/downloads/"+video.uuid+"/"+format.name+"/webm.webm";  
      }
      else {
        var webm_url = "";   
      }
      

      $("#"+input_name+"_"+format.name+"_video").val(mp4_url);
      video.formats[format.name]["video_url"] = mp4_url;

      $("#"+input_name+"_"+format.name+"_mp4").val(mp4_url);
      video.formats[format.name]["mp4_url"] = mp4_url;

      $("#"+input_name+"_"+format.name+"_webm").val(webm_url);
      video.formats[format.name]["webm_url"] = webm_url;

      // thumbnails
      var thumb_url = "//"+appServer+"/downloads/"+video.uuid+"/"+format.name+"/thumb.png";
      $("#"+input_name+"_"+format.name+"_thumb").val(thumb_url);
      video.formats[format.name]["thumb_url"] = thumb_url;

      var small_thumb_url = "//"+appServer+"/downloads/"+video.uuid+"/"+format.name+"/small_thumb.png";
      $("#"+input_name+"_"+format.name+"_small_thumb").val(small_thumb_url);
      video.formats[format.name]["small_thumb_url"] = small_thumb_url;
    });

  };

  self.setMetadata = function(js_object) {
    if (typeof(js_object) != "object") {
      console.warn("setMetadata only accepts Javascript Objects");
      return;
    }

    // set this for future use
    metadata_object = js_object;

    // send info to server if video already published
    if (state == "published") {
      var json_string = JSON.stringify(js_object);
      
      $.ajax({
        url: "//"+appServer+"/api/v"+CameraTag.version+"/cameras/"+camera.uuid+"/assets/"+video.uuid+"/metadata.json",
        data:{form_data: json_string},
        type:"post",
        success: function(response) {
          return true
        },
        error: function(jqXHR, textStatus, errorThrown) {
          throw_error(CT_i18n[35]);
          CameraTag.fire(dom_id, "addDataError", {
            jqXHR: jqXHR,
            textStatus: textStatus,
            errorThrown: errorThrown
          });
          return false;
        }
      })
    }
    
  }
  // backwards campatability
  self.addVideoData = self.setMetadata;
  self.setVideoData = self.setMetadata;

  self.reset = function() {
    // start with a clean slate
    clearTimeout(processed_timer);
    clearTimeout(published_timer);
    clearInterval(record_timer);
    countdown_counter = 0;
    record_timer_count = 0;
    uploading = false;
    error_messages = [];
    readyToPublish = false;
    publishType = webrtc_enabled ? "mediarecorder" : "webcam";
    if (connected) {
      self.disconnect();  
    }

    // create new video
    video = new_video();

    // observe publishing
    CameraTag.observe(video.uuid, "published", function(published_video) {
      if (video.uuid == published_video.uuid) {
        state = "published";
        populate_hidden_inputs();
        self.loadInterface(completed_screen);
        if (connected) {
          self.disconnect();
        }
        CameraTag.fire(dom_id, "published", video);  
        if (poll_processed) {
          pollForProcessed();
        }
      }
    }, true);

    // failed publish
    CameraTag.observe(video.uuid, "publishFailed", function(error) {
      if (video.uuid == error.video_uuid) {
        throw_error(CT_i18n[34] + error.message.error);
      }
    }, true);

    if (!mobile_enabled) {
      recorder.setUUID(video.uuid);
      recorder.showNothing();  
    }
    container.find("input").val("");
    self.loadInterface(start_screen, true);
    self.showRecorder();
    CameraTag.fire(dom_id, "cameraReset");
  }

  // for legacy support
  self.setLength = function(new_length) {
    self.setMaxLength(new_length)
  }

  self.setMaxLength = function(new_length) {
    maxLength = new_length;
    record_timer_prompt.html( "(" + formatted_seconds(new_length) + ")" );
  }

  self.setMinLength = function(new_length) {
    minLength = new_length;
  }


  // publicly accessable methods

  self.send_sms = function() {
    var country_code = $(sms_input).intlTelInput("getSelectedCountryData").dialCode;
    var local_number = $(sms_input).val();
    var complete_number = "+"+country_code+local_number;
    if (local_number == "") {
      alert(CT_i18n[25])
      return;
    }
    wait(CT_i18n[24]);

    // make sure video data has been added before we ditch
    if (metadata_object) {
      self.setMetadata(metadata_object);  
    }
    
    $.ajax({
      url: "//"+appServer+"/api/v"+CameraTag.version+"/cameras/"+camera.uuid+"/videos/"+video.uuid+"/sms",
      data:{number: complete_number, message: CT_i18n[0]},
      type:"post",
      success: function(response, textStatus, jqXHR) {
        if (response.success) {
          self.loadInterface(check_phone_screen);
          CameraTag.fire(dom_id, "smsSent");  
        }
        else {
          self.loadInterface(sms_screen);
          alert(CT_i18n[26]);
          CameraTag.fire(dom_id, "smsError", {
            jqXHR: jqXHR,
            textStatus: textStatus
          });
        } 
      },
      error: function(jqXHR, textStatus, errorThrown) {
        throw_error(CT_i18n[27]);
        CameraTag.fire(dom_id, "smsError", {
          jqXHR: jqXHR,
          textStatus: textStatus,
          errorThrown: errorThrown
        });
        return false;
      }
    })
  }

  self.getVideo = function() {
    return video;
  };

  self.restart_upload = function() {
    self.uploader.restart_upload();
  }

  self.destroy = function() {
    state = "disconnecting";
    if (recorder && connected) {
      recorder.disconnect();
    }
    delete CameraTag.cameras[dom_id];
    container.remove();
  }


  var create_uploader = function(browse_element) {
    var upload_source_index = sources.indexOf("upload");
    if (upload_source_index == -1) {
      var upload_input = $('<input id="'+dom_id+'_upload_file" style="position:absolute;" type="file" accept="video/mp4,video/m4v,video/x-flv,video/flv,video/wmv,video/mpg,video/quicktime,video/webm,video/x-ms-wmv,video/ogg,video/avi,video/mov,video/x-m4v,video/*" capture>')
    } else {
      var upload_input = $('<input id="'+dom_id+'_upload_file" style="position:absolute;" type="file" accept="video/mp4,video/m4v,video/x-flv,video/flv,video/wmv,video/mpg,video/quicktime,video/webm,video/x-ms-wmv,video/ogg,video/avi,video/mov,video/x-m4v,video/*">')
    }
    $(start_screen).append(upload_input);
    $(upload_input).css({
      left: $(browse_element).offset().left - $(browse_element).offsetParent().offset().left,
      top: $(browse_element).offset().top - $(browse_element).offsetParent().offset().top,
      width: $(browse_element).width(),
      height: $(browse_element).height(),
      opacity: 0
    })
    $(browse_element).css({
      zIndex: 1
    })
    $(browse_element).click(function(e){
      if (e.target != upload_input[0]) {
        e.stopPropagation();
        $(upload_input).click();
      }
    })
    

    $(upload_input).change(function(evt){
      file_to_upload = evt.target.files[0];
      CameraTag.fire(dom_id, "uploadFileSelected", file_to_upload);

      if (uploadOnSelect) {
        self.startUpload();
      }

      $(evt.target).val('');
    });
  }


  var pollForProcessed = function() {
    if (poll_processed) {
      $.ajax({
        url: "//"+appServer+"/api/v"+CameraTag.version+"/cameras/"+camera.uuid+"/videos/"+video.uuid+".json",
        type:"get",
        data: {
          referer: window.location.toString()
        },
        success: function(response, textStatus, jqXHR) {
          if (response.formats && response.formats[0] && response.formats[0].state == "COMPLETED") {
            CameraTag.fire(dom_id, "processed", response);
          } 
          else if (response.formats && response.formats[0] && response.formats[0].state == "ERROR") {
            CameraTag.fire(dom_id, "processingFailed", response);
          }
          else {
            processed_timer = setTimeout(pollForProcessed, 2000);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          processed_timer = setTimeout(pollForProcessed, 2000);
          CameraTag.fire(dom_id, "processingPollingError", {
            jqXHR: jqXHR,
            textStatus: textStatus,
            errorThrown: errorThrown
          });
        }
      })
    }
  }

  var pollForPublished = function() {
    $.ajax({
      url: "//"+appServer+"/api/v"+CameraTag.version+"/cameras/"+camera.uuid+"/videos/"+video.uuid+".json",
      type:"get",
      data: {
        referer: window.location.toString()
      },
      success: function(response) {
        if (response.state == "published" || response.state == "processed") {
          CameraTag.fire(video.uuid, "published", response);
          clearInterval(published_timer);
        }
        else {
          published_timer = setTimeout(function(){pollForPublished()}, 4000);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        published_timer = setTimeout(function(){pollForPublished()}, 4000);
        CameraTag.fire(dom_id, "publishedPollingError", {
          jqXHR: jqXHR,
          textStatus: textStatus,
          errorThrown: errorThrown
        });
      }
    })
  }

  var uploadRTC = function() {
    self.loadInterface(upload_screen);
    recorder.uploadRTC();
  }

  // these methods require the swf to be in existance and are created after it's available

  var setupExternalInterface = function() {
    // communication to swf
    self.play = function() {
      if (connected) {
        recorder.startPlayback();
      }
    };

    self.setVideoBitrate = function(rate) {
      recorder.setVideoBitrate(rate);
    };

    self.showFlashSettings = function() {
      self.loadInterface("none");
      recorder.showFlashSettings();
    }

    self.record = function() { // actually calls countdown which will call record_without_countdown in callback
      if (connected) {
        CameraTag.fire(dom_id, "countdownStarted");
        recorder.showRecorder();
        countdown(preRollLength, self.record_without_countdown);
      }
      else {
        self.loadInterface("none");
        self.connect();
      }         
    };

    self.showRecorder = function() {
      recorder.showRecorder();
    }

    self.showPlayer = function() {
      recorder.showPlayer(); 
    }

    self.record_without_countdown = function() {
      if (!readyToRecord) {
        //sendStat("premature_record");
        throw("Camera not ready to record. Please observe 'readyToRecord' event before recording");
        return;  
      }
      state = "recording";
      recorder.showRecorder();
      recorder.startRecording()  
    };

    self.stopPlayback = function() {
      if (connected) {
        recorder.stopPlayback();  
      }
    };

    self.stopRecording = function() {
      if (record_timer_count >= minLength) {
        clearInterval(record_timer);
        if (connected) {
          recorder.stopRecording();  
        }  
      } else {
        console.warn("stopRecording called before minimum length");
      }
    };

    self.connect = function() {
      recorder.connect();
    };

    self.disconnect = function() {
      state = "disconnecting";
      recorder.disconnect();
    };
  }

  var setupEventObservers = function() {
    // communication from swf

    CameraTag.observe(dom_id, "initialized", function() {
      initialized = true;
      state = "initialized";
      if (sources.indexOf("record") != -1) {
        buildSettingsDialog();  
      }
    }, true);

    CameraTag.observe(dom_id, "paused", function() {
      paused_timer = setTimeout(function(){
        paused = true;
        container.find(".cameratag_screen").hide();
        paused_screen.show();  
      }, 1500);
    }, true);

    CameraTag.observe(dom_id, "unpaused", function() {
      clearTimeout(paused_timer);
      if (paused) {
        paused = false;
        paused_screen.hide();
        self.loadInterface(current_screen);
      }
    }, true);

    CameraTag.observe(dom_id, "connecting", function() {
      wait(CT_i18n[39])
    }, true);

    CameraTag.observe(dom_id, "connecting2", function() {
      wait(CT_i18n[40])
    }, true);

    CameraTag.observe(dom_id, "securityDialogOpen", function() {
      self.loadInterface("none");
    }, true);

    CameraTag.observe(dom_id, "securityDialogClosed", function() {
      self.loadInterface(camera_detection_screen);
    }, true);

    CameraTag.observe(dom_id, "settingsDialogClosed", function() {
      self.loadInterface(start_screen, true);
    }, true);

    CameraTag.observe(dom_id, "detectingCamera", function() {
      self.loadInterface(camera_detection_screen);
    }, true);

    CameraTag.observe(dom_id, "hardwareError", function() {
      throw_error(CT_i18n[99]);
    }, true);

    CameraTag.observe(dom_id, "flashInitializationError", function() {
      self.record = function() {
        if (confirm(CT_i18n[2])) {
          window.open("https://get.adobe.com/flashplayer");
        }
      }
    }, true);
    
    CameraTag.observe(dom_id, "unsupportedFlashVersion", function() {
      self.record = function() {
        if (confirm(CT_i18n[2])) {
          window.open("https://get.adobe.com/flashplayer");
        }
      }
    }, true);

  
    CameraTag.observe(dom_id, "noCamera", function() {
      self.record = function() {
        alert(CT_i18n[28]);
      }
    }, true);

    CameraTag.observe(dom_id, "noMic", function() {
      self.record = function() {
        alert(CT_i18n[29]);
      }
    }, true);

    CameraTag.observe(dom_id, "readyToRecord", function() {
      readyToRecord = true;
      if (recordOnConnect) {
        self.record(); //starts countdown    
      } else {
        self.loadInterface("none");
      }
    }, true);

    CameraTag.observe(dom_id, "cameraDenied", function() {
      throw_error(CT_i18n[30]);
    }, true);

    CameraTag.observe(dom_id, "serverConnected", function() {
      connected = true;
    }, true);

    CameraTag.observe(dom_id, "serverDisconnected", function() {
      connected = false;
      readyToRecord = false;
      if (state != "disconnecting" && state != "published" && state != "readyToPublish"){
        self.stopRecording();
        recorder.showNothing();
        throw_error(CT_i18n[31]);
        setTimeout(function(){
          self.loadInterface(start_screen);
        }, 2000);
        //sendStat("pre_record_disconnect_error");
      }
    }, true);

    CameraTag.observe(dom_id, "playbackFailed", function() {
      throw_error(CT_i18n[32]);
      //sendStat("playback_error");
    }, true);

    CameraTag.observe(dom_id, "serverError", function() {
      throw_error(CT_i18n[33]);
      //sendStat("no_server_error");
    }, true);

    CameraTag.observe(dom_id, "waitingForCameraActivity", function() {
      wait(CT_i18n[100]);
    }, true);
    

    CameraTag.observe(dom_id, "countdownStarted", function() {
      self.loadInterface(countdown_screen);
    }, true);

    CameraTag.observe(dom_id, "countdownFinished", function() {
    }, true);

    CameraTag.observe(dom_id, "recordingStarted", function() {
      record_timer_count = 0;
      record_timer = setInterval(function(){ recordTimerTick() }, 1000);
      self.loadInterface(recording_screen);
    }, true);

    CameraTag.observe(dom_id, "recordingStopped", function() {
      clearInterval(record_timer);
      if (skipPreview) {
        recorder.showPlayer();
        self.loadInterface(accept_screen);
      }
      else {
        self.play();
      }
    }, true);

    CameraTag.observe(dom_id, "bufferingDown", function() {
      wait(CT_i18n[37]);
    }, true);    

    CameraTag.observe(dom_id, "recordingTimeOut", function() {
    }, true);

    CameraTag.observe(dom_id, "playbackStarted", function() {
      self.loadInterface(playback_screen);
    }, true);

    CameraTag.observe(dom_id, "playbackStopped", function() {
      self.loadInterface(accept_screen);
    }, true);

    CameraTag.observe(dom_id, "publishing", function() {
      state = "publishing";
    }, true);

    CameraTag.observe(dom_id, "uploadStarted", function() {
      uploading = true;
      self.loadInterface(upload_screen);
    }, true);

    CameraTag.observe(dom_id, "uploadProgress", function(progress) {
      upload_status.html((progress * 100).toFixed(1) + "%");
    }, true);

    CameraTag.observe(dom_id, "uploadAborted", function() {
      uploading = false;
    }, true);

    CameraTag.observe(dom_id, "readyToPublish", function() {
      readyToPublish = true;
      state = "readyToPublish";
    }, true);

    CameraTag.observe(dom_id, "smsSent", function() {
      pollForPublished();
    }, true);

    CameraTag.observe(dom_id, "published", function() {
    }, true);

    CameraTag.observe(dom_id, "publishFailed", function(data) {
      throw_error(CT_i18n[34]);
      //sendStat("publish_error", data);
    }, true);

    CameraTag.observe(dom_id, "processed", function() {
      state = "processed";
      $(container).find(".cameratag_thumb_bg").css({backgroundImage: "url(//"+appServer+"/downloads/"+video.uuid+"/"+camera.formats[0].name+"/thumb.png)"});
    }, true);
  }



  var WebRTCRecorder = function(){
    var self = this;
    var recordVideo;
    var videoPreview = $('<video id="'+dom_id+'-video-preview" style="width:100%; height:100%; object-fit: fill;"></video>');
    container.append(videoPreview);
    var videoPreview = videoPreview[0];
    //videoPreview.style.width = $(container).width()+"px";
    //videoPreview.style.height = $(container).height()+"px";
    
    cams = [];
    mics = [];

    var selected_cam_id;
    var selected_mic_id;

    if (navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(function(devices){
        $(devices).each(function(index, device){
          if (device.kind === 'audioinput') {
            mics.push({
              label: device.label,
              deviceId: device.deviceId
            });
          } else if (device.kind === 'videoinput') {
            cams.push({
              label: device.label,
              deviceId: device.deviceId
            });
          }
        })
        if (cams.length == 0) {
          CameraTag.fire(dom_id, "noCamera");
        } else if (mics.length == 0) {
          CameraTag.fire(dom_id, "noMic");
        } else {
          selected_cam_id = cams[0].deviceId;
          selected_mic_id = mics[0].deviceId;
        }
        CameraTag.fire(dom_id, "initialized");
      });
    } else {
      CameraTag.fire(dom_id, "initialized");
      // no device enumeration supported
    }

    if (flipRecordPreview) {
      videoPreview.style.transform = "scaleX(-1)";
    }
    var wrtc_stream;

    self.setUUID = function(new_uuid) {
      // this stub is needed to comply with the expected recorder API
    };

    self.listCameras = function() {
      return cams;
    }

    self.listMicrophones = function() {
      return mics;
    }

    self.setCamera = function(id) {
      selected_cam_id = id;
    }

    self.setMicrophone = function(id) {
      selected_mic_id = id;
    }

    self.showNothing = function() {
      videoPreview.src = null;
    };

    self.showRecorder = function() {
      if (wrtc_stream) {
        videoPreview.src = window.URL.createObjectURL(wrtc_stream);  
        videoPreview.play();
      }
    };

    self.showPlayer = function() {
      if (recordVideo) {
        videoPreview.src = recordVideo.toURL();  
      }
    };

    self.stopPlayback = function() {
      videoPreview.pause();
      videoPreview.muted = true;
      CameraTag.fire(dom_id, "playbackStopped");
    };

    self.startPlayback = function() {
      videoPreview.src = recordVideo.toURL();
      videoPreview.muted = false;
      videoPreview.play();
      CameraTag.fire(dom_id, "playbackStarted");
  
      $(videoPreview).bind("ended", function() {
         CameraTag.fire(dom_id, "playbackStopped");
      });
    };

    self.connect = function() {
        publishType = "mediarecorder";
        var aspect_ratio = hResolution / vResolution;
        CameraTag.fire(dom_id, "waitingForCameraActivity");

        navigator.getUserMedia({
            audio: {
              deviceId: selected_mic_id
            },
            video: {
                deviceId: selected_cam_id,
                width: hResolution,
                height: vResolution,
                aspectRatio: aspect_ratio,
                optional: [
                  {minAspectRatio: aspect_ratio}, 
                  {maxAspectRatio: aspect_ratio},
                  {minWidth: hResolution},
                  {minHeight: vResolution},
                  {maxWidth: hResolution},
                  {maxHeight: vResolution}
                ]
            }
        }, function(stream) {
            wrtc_stream = stream;
            videoPreview.src = window.URL.createObjectURL(wrtc_stream);
            videoPreview.play();
            videoPreview.muted = true;

            recordVideo = RecordRTC(wrtc_stream, {
                type: "video",
                recorderType: MediaStreamRecorder,
                video: {
                  width: hResolution,
                  height: vResolution
                },
                canvas: {
                    width: hResolution,
                    height: vResolution
                },
                quality: 10,
                bufferSize: bufferSize,
                numberOfAudioChannels: 2,
                videoBitsPerSecond: videoBitRate,
                frameInterval: frameInterval
            });

            CameraTag.fire(dom_id, "serverConnected");
            CameraTag.fire(dom_id, "readyToRecord");

        }, function(error) { 
          CameraTag.fire(dom_id, "cameraDenied");
        });
    };

    self.disconnect = function() {
      if (connected) {
        wrtc_stream.stop();
        connected = false;
      }
    };

    self.startRecording = function() {
      //recordVideo.startRecording();
      videoPreview.muted = true;
      recordVideo.startRecording();
      CameraTag.fire(dom_id, "recordingStarted");
      // recordVideo.initRecorder(function() {
      //   videoPreview.muted = true;
      //   recordVideo.startRecording();
      //   CameraTag.fire(dom_id, "recordingStarted");
      // });
    };

    self.stopRecording = function() {
        wait(CT_i18n[98]);
        recordVideo.stopRecording(function() {
          CameraTag.fire(dom_id, "recordingStopped");
          CameraTag.fire(dom_id, "readyToPublish");
        });
        //wrtc_stream.stop();
    };

    self.uploadRTC = function() {
      
      // state = "uploading";
      // uploading = true; // andorid doesn't seem to get this set through the uploadStarted event?
      CameraTag.fire(dom_id, "uploadStarted");
      // start_screen.css("left", "-10000px");
      // start_screen.css("right", "10000px");

      uploader.add({
        name: 'recordings/' + video.uuid + '.flv',  
        file: recordVideo.blob,
        notSignedHeadersAtInitiate: {
           'Cache-Control': 'max-age=3600'
        },
        xAmzHeadersAtInitiate : {
           'x-amz-acl': 'public-read'
        },
        signParams: {},       
        complete: function(){
          readyToPublish = true;
          publishType = "mediarecorder";
          //sendStat("upload_success", {});
          start_screen.css("left", "0px");
          start_screen.css("right", "0px");

          wait(CT_i18n[38]);
          // call p_o_s directly so we dont upload again
          publish_asset({
            camera_uuid: camera.uuid, 
            asset_uuid: video.uuid, 
            asset_type: "Video",
            type: "mediarecorder", 
            videoServer: videoServer, 
            signature: signature, 
            signature_expiration: signature_expiration, 
            metadata: metadata_object, 
            video_name: video_name, 
            video_description: video_description
          });
        },
        progress: function(progress){
          progress = progress;
          CameraTag.fire(dom_id, "UploadProgress", progress);
          CameraTag.fire(dom_id, "uploadProgress", progress);
          upload_status.html((progress * 100).toFixed(1) + "%");
        }
      });

    }

  }
  // end of WebRTCRecorder

  // setup for CameraTagVideoCamera
  setup();
}
// end of CameraTag Recorder
    //
// Player
//
CameraTagVideo = function(video_el) {
  var cachebuster = parseInt( Math.random() * 100000000 );
  var video_el = $(video_el);
  var new_video_tag;
  var jwplayerInjected = false;
  var uuids;
  var self = this;
  var dom_id = video_el.attr("id") || cachebuster;
  var signature = $(video_el).attr("data-signature");
  var signature_expiration = $(video_el).attr("data-signature-expiration");
  var height;
  var width;
  var player_id;
  var jw_player_instance;
  var user_options = {};
  var playlist;
  var flv_failover;

  var setup = function(){
    // get uuids array
    if (video_el.attr("data-uuid") != "" && video_el.attr("data-uuid")[0] == "[") {
      uuids = eval(video_el.attr("data-uuid"));
    } else if (video_el.attr("data-uuid") != "") {
      uuids = [ video_el.attr("data-uuid") ]
    } else {  
      alert("no video uuids found")
    }

    // parse any options that were passed in
    if (video_el.attr("data-options")) {
      user_options = JSON.parse( video_el.attr("data-options") );  
    }
    else {
      user_options = {}
    }

    // build playlist 
    build_playlist_array(uuids, user_options.image);

  }


  var build_playlist_array = function(uuids, preview_url) {
    playlist = []
    $(uuids).each(function(index, uuid){
      $.ajax({
        url: "//"+appServer+"/api/v"+CameraTag.version+"/videos/"+uuid+".json?signature="+signature+"&signature_expiration="+signature_expiration,
        type:"get",
        data: {
          referer: window.location.toString()
        },
        success: function(video) {
          var format = find_format_by_name( video, video_el.attr("data-format") ) || video.formats[0];
          var source;

          if (format) {
            // determine which source to use based on availability
            if (format.state == "COMPLETED") {
              source = format.mp4_url+"?signature="+signature+"&signature_expiration="+signature_expiration;
              flv_failover = false;
            }
            else if (format.flv_url) {
              source = format.flv_url+"?signature="+signature+"&signature_expiration="+signature_expiration;
              flv_failover = true;
            }
            else {
              // no source available
              flv_failover = false;
              return;
            }

            var thumbnail_url = preview_url || format.thumbnail_url;
            thumbnail_url += "?signature="+signature+"&signature_expiration="+signature_expiration;
            playlist.push({
              image: thumbnail_url,
              sources: [
                { file: source }
              ],
              height: format.height,
              width: format.width,
              uuid: video.uuid,
              ad_server_type: video.ad_server_type,
              ad_server_url: video.ad_server_url
            })

            // set width and height
            var default_width = format.width >= 640 ? (format.width / 2) : format.width;
            var default_height = format.width >= 640 ? (format.height / 2) : format.height;
            width = width || default_width;
            height = height || default_height;

            if (playlist.length == uuids.length) {
              init_jwplayer();
            }  
          }

          else {
            playlist.push({
              image: "https://cameratag.com/videos/v-4f03e790-f640-0131-cc78-12313914f10b/720p/thumb.png",
              sources: [
                { file: "https://cameratag.com/videos/v-4f03e790-f640-0131-cc78-12313914f10b/720p/mp4.mp4" }
              ],
              uuid: video.uuid
            })

            if (playlist.length == uuids.length) {
              init_jwplayer();
            }  
          }
          
        },
        error: function() {
          playlist.push({
            image: "https://cameratag.com/videos/v-4f03e790-f640-0131-cc78-12313914f10b/720p/small_thumb.png",
            sources: [
              { file: "https://cameratag.com/videos/v-4f03e790-f640-0131-cc78-12313914f10b/720p/mp4.mp4" }
            ],
            uuid: "v-4f03e790-f640-0131-cc78-12313914f10b"
          })

          if (playlist.length == uuids.length) {
            init_jwplayer();
          }  
        }
      });
    });
  }

  var find_format_by_name = function(video, name) {
    var result = $.grep(video.formats, function(e){ return e.name == name; });
    return result[0];
  }

  var get_ad_server_url = function() {
    var ad_server_url;
    $(playlist).each(function(index, playlist_el){
      if (playlist_el.ad_server_url) {
        ad_server_url = playlist_el.ad_server_url;
        return ad_server_url;
      }
    })
    return ad_server_url
  }

  var init_jwplayer = function() {
    player_id = video_el.attr("id");
    jwplayer.key="ziVL9s0pxpESKa4mUW9KADbRrkb59LC2qGEI9Q==";

    var default_options = {
      skin: "glow",
      playlist: playlist,
      width: width,
      height: height
    }

    var ad_server_type = playlist[0].ad_server_type;
    var ad_server_url = playlist[0].ad_server_url;
    if (ad_server_url) {
      default_options["advertising"] = {};
      default_options["advertising"]["client"] = ad_server_type;
      default_options["advertising"]["tag"] = ad_server_url;
    }

    if (flv_failover) {
      default_options["stretching"] = "exactfit";
    }

    if (playlist.length > 1) {
      default_options.listbar = {
        position: "right",
        size: 120
      }
    }

    combined_options = $.extend({}, default_options, user_options); 

    jw_player_instance = jwplayer(player_id).setup( combined_options );

    CameraTag.players[player_id] = jw_player_instance;

    setup_player_events();
  }

  var setup_player_events = function() {
    jw_player_instance.onReady(function(){
      CameraTag.fire(player_id, "ready", {});
    })
    jw_player_instance.onSetupError(function(fallback, message){
      CameraTag.fire(player_id, "setupError", {fallback: fallback, message: message});
    })
    jw_player_instance.onPlaylist(function(playlist){
      CameraTag.fire(player_id, "playlist", {playlist: playlist});
    })
    jw_player_instance.onPlaylistItem(function(index, playlist){
      CameraTag.fire(player_id, "playlistItem", {index: index, playlist: playlist});
    })
    jw_player_instance.onPlaylistComplete(function(){
      CameraTag.fire(player_id, "playlistComplete", {});
    })
    jw_player_instance.onBufferChange(function(buffer){
      CameraTag.fire(player_id, "bufferChange", {buffer: buffer});
    })
    jw_player_instance.onPlay(function(){
      CameraTag.fire(player_id, "play", {});

      if (allow_play_count) {
        $.ajax({
          url: "//"+appServer+"/api/v"+CameraTag.version+"/cameras/"+camera.uuid+"/videos/"+jw_player_instance.getPlaylistItem().uuid+"/play_count",
          type:"post",
          success: function() {
            // no need
          }
        })

        // hack for double callbacks
        allow_play_count = false;
        setTimeout(function(){
          allow_play_count = true;
        }, 3000)
      }
      
    })
    jw_player_instance.onPause(function(oldstate){
      CameraTag.fire(player_id, "pause", {oldstate: oldstate});
    })
    jw_player_instance.onBuffer(function(){
      CameraTag.fire(player_id, "buffer", {});
    })
    jw_player_instance.onIdle(function(){
      CameraTag.fire(player_id, "idle", {});
    })
    jw_player_instance.onComplete(function(){
      CameraTag.fire(player_id, "complete", {});
    })
    jw_player_instance.onError(function(message){
      CameraTag.fire(player_id, "error", {message: message});
    })
    jw_player_instance.onSeek(function(position, offset){
      CameraTag.fire(player_id, "seek", {position: position, offset: offset});
    })
    jw_player_instance.onTime(function(duration, position){
      CameraTag.fire(player_id, "time", {duration: duration, position: position});
    })
    jw_player_instance.onMute(function(muted){
      CameraTag.fire(player_id, "mute", {muted: muted});
    })
    jw_player_instance.onVolume(function(volume){
      CameraTag.fire(player_id, "volume", {volume: volume});
    })
    jw_player_instance.onFullscreen(function(fullscreen){
      CameraTag.fire(player_id, "fullscreen", {fullscreen: fullscreen});
    })
    jw_player_instance.onResize(function(width, height){
      CameraTag.fire(player_id, "resize", {width: width, height: height});
    })
    jw_player_instance.onQualityLevels(function(levels){
      CameraTag.fire(player_id, "levels", {levels: levels});
    })
    jw_player_instance.onQualityChange(function(currentQuality){
      CameraTag.fire(player_id, "qualityChange", {currentQuality: currentQuality});
    })
    jw_player_instance.onCaptionsList(function(tracks){
      CameraTag.fire(player_id, "captionsList", {tracks: tracks});
    })
    jw_player_instance.onCaptionsChange(function(track){
      CameraTag.fire(player_id, "captionsChange", {track: track});
    })
    jw_player_instance.onControls(function(controls){
      CameraTag.fire(player_id, "controls", {controls: controls});
    })
    jw_player_instance.onDisplayClick(function(){
      CameraTag.fire(player_id, "displayClick", {});
    })
    jw_player_instance.onAdClick(function(tag){
      CameraTag.fire(player_id, "adClick", {tag: tag});
    })
    jw_player_instance.onAdCompanions(function(tag, companions){
      CameraTag.fire(player_id, "adCompanions", {tag: tag, companions: companions});
    })
    jw_player_instance.onAdComplete(function(tag){
      CameraTag.fire(player_id, "adComplete", {tag: tag});
    })
    jw_player_instance.onAdSkipped(function(tag){
      CameraTag.fire(player_id, "adSkipped", {tag: tag});
    })
    jw_player_instance.onAdError(function(tag, message){
      CameraTag.fire(player_id, "adError", {tag: tag, message: message});
    })
    jw_player_instance.onAdImpression(function(tag){
      CameraTag.fire(player_id, "adImpression", {tag: tag});
    })
    jw_player_instance.onAdTime(function(tag, position, duration){
      CameraTag.fire(player_id, "adTime", {tag: tag, position: position, duration: duration});
    })
    jw_player_instance.onBeforePlay(function(){
      CameraTag.fire(player_id, "beforePlay", {});
    })
    jw_player_instance.onBeforeComplete(function(){
      CameraTag.fire(player_id, "beforeComplete", {});
    })
    jw_player_instance.onMeta(function(metadata){
      CameraTag.fire(player_id, "metadata", {metadata: metadata});
    })
  }

  setup();
}
// end of CameraTagVideo
    CameraTagVideoWall = function(wall_el) {
  var self = this;
  var assets = [];
  var camera_uuid = $(wall_el).attr("data-app-id");
  var dom_id = $(wall_el).attr("id");
  var container = $('<div id="'+dom_id+'" class="camera_tag_video_wall"></div>');

  // user definable parameters
  var perPage = $(wall_el).attr("data-per-page");
  var includeName = $(wall_el).attr("data-include-name") == "true" ? true : false;
  var includeDescription = $(wall_el).attr("data-include-description") == "true" ? true : false;
  var openLightbox = $(wall_el).attr("data-open-lightbox") == "false" ? false : true;
  var targetHeight = $(wall_el).attr("data-thumbnail-height") || 250;
  
  // interface elements
  var lb_overlay = $('<div class="cameratag_lb_overlay"></div>');
  var lb_body = $('<div class="cameratag_lb_body"></div>');
  var lb_wrapper = $('<div class="cameratag_video_wrapper"></div>');

  var signature = $(wall_el).attr("data-signature");
  var expiration = $(wall_el).attr("data-signature-expiration");

  var setup = function(){
    // replace vw el
    $(wall_el).replaceWith(container);

    CameraTag.observe(dom_id, "noAssets", function(){
      console.warn("We couldn't find any assets for your VideoWall '"+dom_id+"'. Have you setup your CameraTag App's security settings to allow wall access?")
    })

    $.ajax({
      url: "//"+appServer+"/api/v"+CameraTag.version+"/cameras/"+camera_uuid+"/assets/wall.json",
      type: "get",
      data: {
        n: perPage
      },
      success: function(response) {
        if (typeof(response) == "object" && response.length > 0) {
          assets = response;
          buildInterface();
        } else {
          CameraTag.fire(dom_id, "noAssets");
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        CameraTag.fire(dom_id, "serverError", {
          jqXHR: jqXHR,
          textStatus: textStatus,
          errorThrown: errorThrown
        });
      }
    })

    CameraTag.video_walls[dom_id] = self;
  }

  var buildInterface = function() {
    // setup lightbox
    $("body").append(lb_overlay);
    $(lb_overlay).click(self.closeVideo);
    
    $("body").append(lb_body);
    $(lb_body).append(lb_wrapper);

    $(assets).each(function(index, asset){
      if (asset.formats.length > 0) {
        var width = asset.formats[0].width;
        var height = asset.formats[0].height;
      } else {
        var width = 640;
        var height = 480;
      }
      // create the elements
      var asset_el = $('<div id="'+dom_id+'_'+asset.uuid+'" class="cameratag_video_container"></div>');
      var thumbnail_el = $('<img src="'+asset.preview_thumbnail_url+'?signature='+signature+'&signature_expiration='+expiration+'" class="cameratag_video_thumbnail_container" data-width="'+width+'" data-height="'+height+'"></img>');
      var name_el = $('<div class="cameratag_video_name">'+asset.name+'</div>');
      var description_el = $('<div class="cameratag_video_description">'+asset.description+'</div>');

      // assmble it all
      $(asset_el).append(thumbnail_el);
      if (includeName) {
        $(asset_el).append(name_el);
      }
      if (includeDescription) {
        $(asset_el).append(description_el);
      }

      $(container).append(asset_el);
      if (openLightbox) {
        $(asset_el).click(function(){
          openAsset(asset);
        })  
      }
    })

    var ag = new AssetGrid(container, ".cameratag_video_thumbnail_container", targetHeight);
  }

  var openAsset = function(asset) {
    // open lightbox and create player
    var max_width = parseInt($("#"+dom_id+"_"+asset.uuid).attr("data-width"));
    var max_height = parseInt($("#"+dom_id+"_"+asset.uuid).attr("data-height"));
    $(lb_body)[0].style.maxWidth = max_width+"px";
    $(lb_body)[0].style.maxHeight = max_height+"px";
    if (asset.type == "Video") {
      lb_body.html('<video id="ct_video_player" data-signature="'+signature+'" data-signature-expiration="'+expiration+'" data-options=\'{"width":"100%", "height":"100%"}\' data-uuid="'+asset.uuid+'"></video>');  
    } else if (asset.type == "Photo") {
      lb_body.html('<img src="'+asset.preview_thumbnail_url+'?signature='+signature+'&signature_expiration='+expiration+'" id="ct_image" style="width:100%; height:100%"></img>');
    }
    lb_overlay.show();
    lb_body.show();
    if (asset.type == "Video") {
      CameraTag.setup();
    }
  }

  self.closeVideo = function() {
    lb_overlay.hide();
    lb_body.hide();
    lb_body.html("");
  }

  setup();
}
// End of Video Wall
    CameraTagPhotoCamera = function(booth_el) {
  // interface
  var container;
  var start_screen;
  var mobile_start_screen;
  var capture_screen;
  var review_screen;
  var upload_screen;
  var settings_screen;
  var error_screen;
  var wiat_screen;
  var published_screen;
  var uuid_input;
  var url_input;

  var current_screen;
  var last_screen;

  var preview_canvas_placeholder;
  var review_canvas_placeholder;
  var review_img;
  var nubs_el;
  var trigger;
  var image_frame;
  var published_img;
  var photo;
  var offset_dragger;
  var offset_dragger_container;
  var dragger_container_top;
  var dragger_container_left;
  var dragger_container_width;
  var dragger_container_height;
  var image_container;
  var filter_container;
  var filter_properties;
  var filter_selector;
  var flash;
  var shutter_sound;
  var wait_message;
  var error_message;
  var apply_button;
  var cancel_button;
  var accept_button;
  var retake_button;
  var upload_status;

  // configuraion
  var width;
  var height;
  var hResolution;
  var vResolution;
  var sources = ["webcam", "upload", "sms"];
  var permitted_extensions = ["jpg", "gif", "bmp", "png", "jpeg"];

  // internal usage
  var self = this;
  var state;
  var booth;
  var review_canvas;
  var uuid;
  var camera_uuid;
  var signature;
  var signature_expiration;
  var dom_id;
  var frame_data;
  var filtered_frame_data;
  var frame = 0;
  var uploader;
  var metadata;
  var connected;
  var input_name;
  var metadata_object;
  var errors = [];
  var cachebuster = parseInt( Math.random() * 100000000 );

  var WebRTCBooth = function(placeholder_el) {
    var self = this;
    var video_el;
    var canvas;
    var context;
    var stream;
    var output_frame;
    self.cams = [];
    var selected_cam_id;


    var init = function() {

      // create canvas and video el
      canvas = $('<canvas></canvas>');
      video_el = $('<video></video>');
      context = canvas[0].getContext('2d');
      $(placeholder_el).replaceWith(video_el);
      $(canvas).insertAfter(video_el);

      video_el[0].width = width;
      video_el[0].height = height;
      if (flip_preview) {
        videoPreview.style.transform = "scaleX(-1)";
      }

      canvas.attr("width", hResolution);
      canvas.attr("height", vResolution);
      canvas.hide();

      // start rendering when the video el is ready
      video_el[0].addEventListener('canplay', function(ev){
        draw();
      }, false);

      // initialize
      CameraTag.fire(dom_id, "initialized");
    }

    self.setCamera = function(camera_id) {
      selected_cam_id = camera_id;
    }

    self.connect = function() {
      navigator.getUserMedia({
        audio: false,
        video: {
          deviceId: selected_cam_id,
          width: hResolution,
          height: vResolution,
          optional: [
            {minWidth: hResolution},
            {minHeight: vResolution},
            {maxWidth: hResolution},
            {maxHeight: vResolution}
          ]
        }
      }, 
      function(new_stream) {
        connected = true;
        stream = new_stream;

        if (typeof(video_el[0].srcObject) == "undefined") {
          video_el[0].src = URL.createObjectURL(new_stream);
        } else {
          video_el[0].srcObject = new_stream;
        }
        
        video_el[0].play();
        CameraTag.fire(dom_id, "connected");
      },
      function(message){
        CameraTag.fire(dom_id, "cameraError");
        error(message);
      });
    }

    self.disconnect = function() {
      if (connected) {
        stream.stop();
        connected = false;
        CameraTag.fire(dom_id, "disconnected");
      }
    }

    self.hide = function() {
      video_el.hide();
    }

    self.show = function() {
      video_el.show();
    }

    self.getFrame = function() {
      return output_frame;
    }

    var draw = function() {
      // dont draw if paused
      if(video_el[0].paused || video_el[0].ended) return false;

      // draw to canvas
      context.drawImage(video_el[0],0,0,hResolution,vResolution);
      setTimeout(draw,40);

      // save result to buffer
      output_frame = canvas[0].toDataURL('image/jpg');
    }

    init();
  }

  var FlashBooth = function(placeholder_el) {
    var self = this;
    var swf;

    var init = function() {
      var flashvars = {
        dom_id: dom_id,
        flipPreview: flip_preview
      };

      var params = {
        allowfullscreen: 'true',
        allowscriptaccess: 'always',
        wmode: "transparent"
      };

      var attributes = {
        id: dom_id+"_swf",
        name: dom_id+"_swf"
      };

      // create space for swf in interface
      var swf_placeholder = $('<div id="'+dom_id+'_swf_placeholder"></div>');
      $(placeholder_el).parents(".cameratag_photobooth_container").prepend(swf_placeholder);
      swfobject.embedSWF("//"+appServer+"/static/"+CameraTag.version+"/photobooth.swf?"+cachebuster, dom_id+"_swf_placeholder", "100%", "100%", '11.1.0', 'https://'+appServer+'/static/'+CameraTag.version+'/expressInstall.swf', flashvars, params, attributes, waitForSwf);

      // add spacer so we can see swf
      spacer = $('<div style="width:'+width+'px; height:'+height+'px;"></div>');
      $(placeholder_el).replaceWith(spacer);
    }

    var waitForSwf = function(){
      swf = $("#"+dom_id+"_swf")[0];
      if (typeof(swf) == "undefined") {
        setTimeout(waitForSwf,200);
      } else {
        // got swf handle
      }
    }

    // init = function() {
    //   swf = $('<object type="application/x-shockwave-flash" id="'+dom_id+'_photobooth_swf" name="'+dom_id+'_photobooth_swf" data="//'+appServer+'/static/8/photobooth.swf?46356162" width="'+width+'" height="'+height+'"><param name="allowfullscreen" value="true"><param name="allowscriptaccess" value="always"><param name="wmode" value="transparent"><param name="flashvars" value="dom_id='+dom_id+'&flipPreview='+flip_preview+'"></object>');
    //   $(swf).insertBefore(start_screen);
    //   waitForSwf();
    //   spacer = $('<div style="width:'+width+'px; height:'+height+'px;"></div>');
    //   $(placeholder_el).replaceWith(spacer);
    // }

    // var waitForSwf = function(){
    //   swf = $("#"+dom_id+"_photobooth_swf")[0];
    //   if (typeof(swf) == "undefined") {
    //     setTimeout(waitForSwf,200);
    //   } else {
    //     // got swf handle
    //   }
      
    // }

    self.connect = function(){
      swf.connect();
    }

    self.hide = function() {
      $(swf).hide();
    }

    self.show = function() {
      $(swf).show();
    }

    self.disconnect = function(){
      swf.disconnect(); 
    }

    self.getFrame = function(){
      return swf.getFrame();  
    }

    self.showFlashSettings = function() {
      swf.showFlashSettings();   
    }

    init();
  }

  var ImageProcessor = function(placeholder_el) {
    var self = this;
    var parent_effect_canvas = this;

    var crop_canvas;
    var crop_context;

    var effect_canvas;
    var effect_texture;

    var input_img;
    var input_width;
    var input_height;

    var x_offset = 0;
    var y_offset = 0;
    var max_x_offset;
    var max_y_offset;
    var default_zoom_multiplier;
    var user_zoom_multiplier;
    var final_zoom_multiplier;
    var scaled_width;
    var scaled_height;
    var font_size;

    var preview_img;
    var preview_multiplier = hResolution / width;
    var output_frame;

    self.selected_filter = null;

    var init = function() {
      // build our canvases and output image
      input_img = $('<img></img>');
      crop_canvas = $('<canvas></canvas>');
      try {
        effect_canvas = fx.canvas();
      } catch (e) {
        error(e);
        return;
      }
      preview_img = $('<img></img>');

      // set heights
      crop_canvas.attr("width", hResolution);
      crop_canvas.attr("height", vResolution);
      // ** effects canvas height / width will be set by glfx
      preview_img.attr("width", width);


      // add the key elements to the DOM
      $(placeholder_el).replaceWith(preview_img);
      $(effect_canvas).insertAfter(preview_img);
      $(crop_canvas).insertAfter(effect_canvas);
      $(input_img).insertAfter(crop_canvas);

      // hide the guts
      input_img.hide();
      crop_canvas.hide();
      $(effect_canvas).hide();
      
      // get contexts and txtures
      crop_context = crop_canvas[0].getContext('2d');

      // default filter
      self.select_filter(0);

      if (mobile_enabled) {
        CameraTag.fire(dom_id, "initialized");
      }
    }

    self.select_filter = function(filter_index) {
      if (filter_index == 0) {
        review_edit_controls.hide();
        review_ready_controls.show();
      } else {
        review_edit_controls.show();
        review_ready_controls.hide();
      }
      if (filter_index == 1) {
        offset_dragger.show();
        zoom_slider.slider("value", 1);
        zoom_slider_container.show();  
      } else {
        offset_dragger.hide();
        resetZoom();
        zoom_slider_container.hide();
      }

      self.selected_filter = self.filters[filter_index];
      self.selected_filter.use();
      filter_selector.val(filter_index);
      self.draw();
    };

    self.setUserZoom = function(new_user_zoom_multiple) {
      user_zoom_multiplier = new_user_zoom_multiple;
      final_zoom_multiplier = default_zoom_multiplier * user_zoom_multiplier;
      scaled_width = input_width * final_zoom_multiplier;
      scaled_height = input_height * final_zoom_multiplier;
      max_x_offset = scaled_width - hResolution;
      max_y_offset = scaled_height - vResolution;
      
      // handler draggable
      var display_multiplier = 1 / preview_multiplier;

      dragger_container_left = max_x_offset * display_multiplier;
      dragger_container_top = max_y_offset * display_multiplier;
      drag_container_width = (scaled_width + max_x_offset) * display_multiplier;
      drag_container_height = (scaled_height + max_y_offset) * display_multiplier;

      var dragger_width = scaled_width * display_multiplier;
      var dragger_height = scaled_height * display_multiplier;
      
      offset_dragger_container.css({left:dragger_container_left * -1, top:dragger_container_top * -1, width: drag_container_width, height:drag_container_height});

      $(offset_dragger).css({width: dragger_width, height: dragger_height, top: dragger_container_top, left: dragger_container_left});
      $(offset_dragger).draggable("option", "containment", "parent");
    };

    self.setOffset = function(x,y) {
      x_offset = x * preview_multiplier;
      if (x_offset > 0) {
        x_offset = 0;
      } else if (x_offset < max_x_offset * -1) {
        x_offset = max_x_offset * -1;
      }

      y_offset = y * preview_multiplier;
      if (y_offset > 0) {
        y_offset = 0;
      } else if (y_offset < max_y_offset * -1) {
        y_offset = max_y_offset * -1;
      }
    }

    self.applyFilter = function() {
      self.draw(output_frame);
      x_offset = 0;
      y_offset = 0;
      zoom_slider.slider("value", 1);
      self.select_filter(0);
    }

    var setupNewImageData = function() {
      // get image dimensions
      input_width = input_img[0].width;
      input_height = input_img[0].height;

      // determine default zoom,
      var width_ratio =  hResolution / input_width;
      var height_ratio = vResolution / input_height;

      default_zoom_multiplier = (width_ratio > height_ratio) ? width_ratio : height_ratio;

      self.setUserZoom(1);

      self.draw();
    }

    self.draw = function(image_data) {
      // redner the input to an imput img
      if (image_data) {
        input_img[0].onload = setupNewImageData;
        input_img[0].src = image_data;
        return;
      }

      // render the input image to the crop canvas
      crop_context.drawImage(input_img[0],x_offset,y_offset,scaled_width,scaled_height);
      // render the crop canvas to the effects canvas
      effect_texture = effect_canvas.texture(crop_canvas[0]);
      self.selected_filter.draw(hResolution,vResolution);
      var current_frame = effect_canvas.toDataURL('image/png');
      preview_img[0].src = current_frame;
      output_frame = current_frame; 
    }

    self.getFrame = function() {
      return output_frame;
    }

    //
    // FILTERS
    //

    var Filter = function(name, init, render) {
      var self = this;
      self.name = name;
      var init = init;
      
      var sliders = [];
      var nubs = [];

      self.draw = function(width, height) {
        render(self, width, height);
      }

      self.addNub = function(name, x, y) {
        nubs.push({ name: name, x: x, y: y });
      };

      self.addSlider = function(name, label, min, max, value, step) {
        sliders.push({ name: name, label: label, min: min, max: max, value: value, step: step });
      };

      self.use = function() {
        // Clear all setting rows but the first two (which contain the filter selector and code sample)
        filter_properties.html("");

        // Add a row for each slider
        for (var i = 0; i < sliders.length; i++) {
            var slider = sliders[i];
            $('<div class="cameratag_photobooth_filter_property"><div class="cameratag_photobooth_filter_property_title">' + slider.label.replace(/ /g, '&nbsp;') + ':</div><div cameratag_photobooth_filter_property_slider" id="slider' + i + '"></div></div>').appendTo(filter_properties);
            var onchange = (function(this_, slider) { return function(event, ui) {
                this_[slider.name] = ui.value;
                parent_effect_canvas.draw();
            }; })(this, slider);
            $('#slider' + i).slider({
                slide: onchange,
                change: onchange,
                min: slider.min,
                max: slider.max,
                value: slider.value,
                step: slider.step
            });
            self[slider.name] = slider.value;
        }

        // Add a div for each nub
        $(".cameratag_photobooth_nub").remove();
        for (var i = 0; i < nubs.length; i++) {
            var nub = nubs[i];
            var x = nub.x * preview_img[0].width;
            var y = nub.y * preview_img[0].height;
            $('<div class="cameratag_photobooth_nub" id="nub' + i + '"></div>').appendTo(nubs_el);
            var ondrag = (function(this_, nub) { return function(event, ui) {
                var offset = $(event.target.parentNode).offset();
                var adjusted_x = (ui.offset.left - offset.left) * preview_multiplier;
                var adjusted_y = (ui.offset.top - offset.top) * preview_multiplier;
                this_[nub.name] = { x: adjusted_x, y: adjusted_y };
                parent_effect_canvas.draw();
            }; })(this, nub);
            $('#nub' + i).draggable({
                drag: ondrag,
                containment: 'parent',
                scroll: false
            }).css({ left: x, top: y });
            self[nub.name] = { x: (x * preview_multiplier), y: (y * preview_multiplier) };
        }
      }

      // initiaize the filter interface
      init(self);
    }

    var perspectiveNubs = [175, 156, 496, 55, 161, 279, 504, 330];

    // Filters Objects Array
    self.filters = [
      new Filter(CT_i18n[50], function(filter) {
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).update();
      }),

      new Filter(CT_i18n[51], function(filter) {
      }, function(filter, width, height) {
        effect_canvas.draw(effect_texture, hResolution, vResolution).update();
      }),

      new Filter(CT_i18n[52], function(filter) {
        filter.addSlider('frame', CT_i18n[92], 0, 200, 0, 1);
      }, function(filter, width, height) {
        effect_canvas.draw(effect_texture, hResolution, vResolution).smoke(filter.frame).update();
      }),

      new Filter(CT_i18n[53], function(filter) {
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).murica().update();
      }),

      new Filter(CT_i18n[54], function(filter) {
          filter.addSlider('brightness', CT_i18n[87], -1, 1, 0, 0.01);
          filter.addSlider('contrast', CT_i18n[97], -1, 1, 0, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).brightnessContrast(filter.brightness,filter.contrast).update();
      }),

      new Filter(CT_i18n[55], function(filter) {
          filter.addSlider('luminanceThreshold', CT_i18n[96], 0, 1, .2, 0.1);
          filter.addSlider('colorAmplification', CT_i18n[95], 0, 10, 4.0, 0.5);
          filter.addSlider('frame', CT_i18n[92], 0, 200, 0, 1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).nightvision(filter.frame, filter.luminanceThreshold, filter.colorAmplification).update();
      }),

      new Filter(CT_i18n[56], function(filter) {
          filter.addSlider('gamma', CT_i18n[94], 0, 2, 0.6, 0.01);
          filter.addSlider('numColors', CT_i18n[93], 0, 24, 8.0, 1.0);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).posterize(filter.gamma,filter.numColors).update();
      }),

      new Filter(CT_i18n[57], function(filter) {
          filter.addSlider('red', 'Red', -1, 1, 0.5, 0.1);
          filter.addSlider('green', 'Green', -1, 1, 0.3, 0.1);
          filter.addSlider('blue', 'Blue', -1, 1, 0.2, 0.1);
          filter.addSlider('sat', 'Saturation', -1, 1, 0.2, 0.1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).zinc(filter.red,filter.green,filter.blue,filter.sat).update();
      }),

      new Filter(CT_i18n[58], function(filter) {
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).berry().update();
      }),

      new Filter(CT_i18n[59], function(filter) {
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).spycam().update();
      }),

      new Filter(CT_i18n[60], function(filter) {
          filter.addSlider('size', CT_i18n[83], 0.1, 1.0, .5, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).magazine(filter.size).update();
      }),

      new Filter(CT_i18n[61], function(filter) {
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).crosshatch().update();
      }),

      new Filter(CT_i18n[62], function(filter) {
        filter.addSlider('frame', CT_i18n[92], 0, 200, 0, 1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).flare(filter.frame).update();
      }),

      new Filter(CT_i18n[63], function(filter) {
          filter.addSlider('hue', CT_i18n[90], -1, 1, 0, 0.01);
          filter.addSlider('saturation', CT_i18n[91], -1, 1, 0, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).hueSaturation(filter.hue, filter.saturation).update();
      }),

      new Filter(CT_i18n[64], function(filter) {
          filter.addSlider('amount', CT_i18n[86], -1, 1, 0.5, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).vibrance(filter.amount).update();
      }),

      new Filter(CT_i18n[65], function(filter) {
          filter.addSlider('exponent', CT_i18n[86], 0, 50, 20, 1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).denoise(filter.exponent).update();
      }),

      new Filter(CT_i18n[66], function(filter) {
          filter.addSlider('radius', CT_i18n[85], 0, 200, 20, 1);
          filter.addSlider('strength', CT_i18n[86], 0, 5, 2, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).unsharpMask(filter.radius, filter.strength).update();
      }),

      new Filter(CT_i18n[67], function(filter) {
          filter.addSlider('amount', CT_i18n[86], 0, 1, 0.5, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).noise(filter.amount).update();
      }),

      new Filter(CT_i18n[68], function(filter) {
          filter.addSlider('amount', CT_i18n[86], 0, 1, 1, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).sepia(filter.amount).update();
      }),

      new Filter(CT_i18n[69], function(filter) {
          filter.addSlider('size', CT_i18n[83], 0, 1, 0.5, 0.01);
          filter.addSlider('amount', CT_i18n[86], 0, 1, 0.5, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).vignette(filter.size, filter.amount).update();
      }),

      new Filter(CT_i18n[70], function(filter) {
          filter.addNub('center', 0.5, 0.5);
          filter.addSlider('strength', CT_i18n[86], 0, 1, 0.3, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).zoomBlur(filter.center.x, filter.center.y, filter.strength).update();
      }),

      new Filter(CT_i18n[71], function(filter) {
          filter.addSlider('radius', CT_i18n[85], 0, 200, 50, 1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).triangleBlur(filter.radius).update();
      }),

      new Filter(CT_i18n[72], function(filter) {
          filter.addNub('start', 0.15, 0.75);
          filter.addNub('end', 0.75, 0.6);
          filter.addSlider('blurRadius', CT_i18n[88], 0, 50, 15, 1);
          filter.addSlider('gradientRadius', CT_i18n[89], 0, 400, 200, 1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).tiltShift(filter.start.x, filter.start.y, filter.end.x, filter.end.y, filter.blurRadius, filter.gradientRadius).update();
      }),

      new Filter(CT_i18n[73], function(filter) {
          filter.addSlider('radius', CT_i18n[85], 0, 50, 10, 1);
          filter.addSlider('brightness', CT_i18n[87], -1, 1, 0.75, 0.01);
          filter.addSlider('angle', CT_i18n[82], -Math.PI, Math.PI, 0, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).lensBlur(filter.radius, filter.brightness, filter.angle).update();
      }),

      new Filter(CT_i18n[74], function(filter) {
          filter.addNub('center', 0.5, 0.5);
          filter.addSlider('angle', CT_i18n[82], -25, 25, 3, 0.1);
          filter.addSlider('radius', CT_i18n[85], 0, 600, 200, 1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).swirl(filter.center.x, filter.center.y, filter.radius, filter.angle).update();
      }),

      new Filter(CT_i18n[75], function(filter) {
          filter.addNub('center', 0.5, 0.5);
          filter.addSlider('strength', CT_i18n[86], -1, 1, 0.5, 0.01);
          filter.addSlider('radius', CT_i18n[85], 0, 600, 200, 1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).bulgePinch(filter.center.x, filter.center.y, filter.radius, filter.strength).update();
      }),

      new Filter(CT_i18n[76], function(filter) {
          filter.addSlider('strength', CT_i18n[86], 0, 1, 0.25, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).ink(filter.strength).update();
      }),

      new Filter(CT_i18n[77], function(filter) {
          filter.addSlider('radius', CT_i18n[85], 0, 200, 10, 1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).edgeWork(filter.radius).update();
      }),

      new Filter(CT_i18n[78], function(filter) {
          filter.addNub('center', 0.5, 0.5);
          filter.addSlider('scale', CT_i18n[84], 10, 100, 20, 1);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).hexagonalPixelate(filter.center.x, filter.center.y, filter.scale).update();
      }),

      new Filter(CT_i18n[79], function(filter) {
          filter.addNub('center', 0.5, 0.5);
          filter.addSlider('angle', CT_i18n[82], 0, Math.PI / 2, 1.1, 0.01);
          filter.addSlider('size', CT_i18n[83], 3, 20, 3, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).dotScreen(filter.center.x, filter.center.y, filter.angle, filter.size).update();
      }),

      new Filter(CT_i18n[80], function(filter) {
          filter.addNub('center', 0.5, 0.5);
          filter.addSlider('angle', CT_i18n[82], 0, Math.PI / 2, 0.25, 0.01);
          filter.addSlider('size', CT_i18n[83], 3, 20, 4, 0.01);
      }, function(filter, width, height) {
          effect_canvas.draw(effect_texture, hResolution, vResolution).colorHalftone(filter.center.x, filter.center.y, filter.angle, filter.size).update();
      })
    ]

    init();

  }

  var init = function() {
    // get parameters
    uuid = generateUUID("i-");
    flip_preview = !$(booth_el).attr("data-mirror-preview") == "false";
    dom_id = $(booth_el).attr("id");
    camera_uuid = $(booth_el).attr("data-app-id");
    signature = $(booth_el).attr("data-signature");
    signature_expiration = $(booth_el).attr("data-signature-expiration");
    input_name = $(booth_el).attr("name") || dom_id;
    metadata = $(booth_el).attr("data-metadata");

    try {
      metadata_object = JSON.parse(metadata);
    }
    catch (e) {
      if (metadata != undefined) {
        console.warn("Could not parse user-data JSON from <photobooth> attribute."); 
      }
    }

    get_camera(camera_uuid, function(server_response){
      if (server_response.success) {
        // set dimensions
        hResolution = $(booth_el).attr("data-horizontal-resolution") || server_response.camera.photo_width;
        vResolution = $(booth_el).attr("data-vertical-resolution") || server_response.camera.photo_height;
        width = $(booth_el).attr("data-width") || hResolution / 2;
        height = $(booth_el).attr("data-height") || vResolution / 2;

        // build the interface
        buildInterface();
        if (webrtc_enabled) {
          buildSettingsDialog();
        }

        // init the uploader
        uploader = new Evaporate({
           signerUrl: '//cameratag.com/api/v'+CameraTag.version+'/videos/upload_signature',
           aws_key: 'AKIAJCHWZMZ35EB62V2A',
           bucket: 'assets.cameratag.com',
           aws_url: 'https://d2az0z6s4nrieh.cloudfront.net',
           cloudfront: true,
           logging: false
        });

        // observe publishing
        CameraTag.observe(uuid, "published", function(published_image) {
          state = "published";
          if (uuid == published_image.uuid) {
            if (connected) {
              self.disconnect();  
            }
            if (booth) {
              booth.hide();
            }
            self.loadInterface(published_screen);
            published_img[0].src = review_canvas.getFrame();
            uuid_input.val(uuid);
            url_input.val("//"+appServer+"/downloads/"+uuid+".jpg");
            CameraTag.fire(dom_id, "published", published_image);
          }
        }, true);

        // failed publish
        CameraTag.observe(uuid, "publishFailed", function(error_msg) {
          error(CT_i18n[34] + ": "+ error_msg.message.error);
        }, true);

        CameraTag.observe(dom_id, "cameraError", function() {
          error("Error Accessing Your Camera");
        }, true);

        CameraTag.observe(dom_id, "connecting", function() {
          self.loadInterface("none");
        }, true);

        CameraTag.observe(dom_id, "connected", function() {
          self.loadInterface(capture_screen);
        }, true);

        CameraTag.observe(dom_id, "settingsDialogClosed", function() {
          self.loadInterface(start_screen);
        }, true);

        CameraTag.observe(dom_id, "initialized", function() {
          state = "initialized";
          if (mobile_enabled) {
            self.loadInterface(mobile_start_screen);
          } else {
            self.loadInterface(start_screen);  
          }
        }, true);    
        

        // register ourself with CameraTag
        CameraTag.photobooths[dom_id] = self;
      }
      else {
        errors.push(server_response.message);
        return
      }
    });
  };

  var buildInterface = function() {
    var font_awesome = $('<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" media="all" rel="stylesheet" type="text/css" />');
    $("head").append(font_awesome);

    // container
    container = $('<div class="cameratag_photobooth_container"></div>');

    // start_screen
    start_screen = $("#"+dom_id+"-start-screen").addClass("cameratag_photobooth_screen");
    if (start_screen.length == 0) {
      start_screen = $('<div class="cameratag_photobooth_start_screen cameratag_photobooth_screen"></div>');
      var selection_prompt = $('<a class="cameratag_select_prompt">'+CT_i18n[45]+'</a>');
      var capture_button = $('<a class="cameratag_primary_link cameratag_record_link cameratag_photobooth_capture"><span class="cameratag_action_icon">&#61501;</span><br><span class="cameratag_prompt_label">'+CT_i18n[46]+'</span></a>');
      var upload_button = $('<a id="'+dom_id+'_upload_link" class="cameratag_primary_link cameratag_upload_link cameratag_upload"><span class="cameratag_action_icon">&#61678;</span><br><span class="cameratag_prompt_label">'+CT_i18n[47]+'</span></a>');
      var sms_button = "";//$('<a class="cameratag_primary_link cameratag_sms_link"><span class="cameratag_action_icon">&#61707;</span><br><span class="cameratag_prompt_label">'+CT_i18n[7]+'</span></a>');

      var settings_btn = $('<img class="cameratag_settings_btn" src="//cameratag.com/assets/gear.png">');
      start_screen.append(settings_btn);  

      // populate screen
      start_screen.append(selection_prompt).append(capture_button).append(upload_button).append(sms_button);
    }

    // mobile start screen
    mobile_start_screen = $("#"+dom_id+"-mobile-start-screen").addClass("cameratag_photobooth_screen");
    if (mobile_start_screen.length == 0) {
      mobile_start_screen = $('<div class="cameratag_photobooth_mobile_start_screen cameratag_photobooth_screen"></div>');
      var selection_prompt = $('<a class="cameratag_select_prompt">'+CT_i18n[49]+'</a>');
      var mobile_button = $('<a class="cameratag_primary_link cameratag_sms_link"><span class="cameratag_action_icon">&#61707;</span><br><span class="cameratag_prompt_label"></span></a>');

      // populate screen
      mobile_start_screen.append(selection_prompt).append(mobile_button);
    }

    // settings screen
    if (webrtc_enabled) {
      settings_screen = $("#"+dom_id+"-settings-screen").addClass("cameratag_photobooth_screen");
      if (settings_screen.length == 0) {
        settings_screen = $('<div id="'+dom_id+'_settings_screen" class="cameratag_photobooth_screen cameratag_phoobooth_setings_screen"></div>');
      }
    }

    // upload screen
    upload_screen = $("#"+dom_id+"-upload-screen").addClass("cameratag_photobooth_screen");
    upload_status = upload_screen.find(".cameratag_photobooth_upload_status");
    if (upload_screen.length == 0) {
      upload_screen = $('<div class="cameratag_photobooth_upload_screen cameratag_photobooth_screen"></div>');
      var upload_prompt = $('<div class="cameratag_prompt">'+CT_i18n[10]+'</div>');
      upload_status = $('<div class="cameratag_photobooth_upload_status"></div>');
      upload_screen.append(upload_status);
      upload_screen.append(upload_prompt);
    }

    // start_screen
    capture_screen = $("#"+dom_id+"-capture-screen").addClass("cameratag_photobooth_screen");
    if (capture_screen.length == 0) {
      capture_screen = $('<div class="cameratag_photobooth_capture_screen cameratag_photobooth_screen"></div>');
      preview_canvas_placeholder = $('<div class="cameratag_photobooth_canvas_placeholder">Loading...</div>');
      var trigger_container = $('<div class="cameratag_photobooth_trigger_container"></div>')
      trigger = $('<div class="cameratag_photobooth_trigger"></div>');
      trigger_container.append(trigger);
      
      // populate screen
      capture_screen.append(preview_canvas_placeholder).append(trigger_container);
    }

    // review_screen
    review_screen = $("#"+dom_id+"-review-screen").addClass("cameratag_photobooth_screen");
    if (review_screen.length == 0) {
      review_screen = $('<div class="cameratag_photobooth_review_screen cameratag_photobooth_screen"></div>');
      
      image_frame = $('<div class="cameratag_photobooth_image_frame"></div>');
      review_canvas_placeholder = $('<div class="cameratag_photobooth_review_canvas_placeholer"></div>');
      offset_dragger_container = $('<div class="cameratag_photobooth_offset_dragger_container"></div>');
      offset_dragger = $('<div class="cameratag_photobooth_offset_dragger"></div>');
      offset_dragger_container.append(offset_dragger);
      nubs_el = $('<div class="cameratag_photobooth_nubs_el"></div>');
      image_frame.append(review_canvas_placeholder).append(nubs_el).append(offset_dragger_container);

      review_edit_controls = $('<div class="cameratag_review_edit_controls"></div>');
      filter_container = $('<div class="cameratag_photobooth_filter_container"></div>')
      filter_properties = $('<table class="cameratag_photobooth_filter_properties"></div>');
      zoom_slider_container = $('<div class="cameratag_photobooth_filter_property"></div>')
      zoom_slider_title = $('<div class="cameratag_photobooth_filter_property_title">Zoom Level</div>')
      zoom_slider = $('<div class="cameratag_photobooth_filter_proprty_slider"></div>');
      zoom_slider_container.append(zoom_slider_title).append(zoom_slider);
      apply_button = $('<a class="cameratag_photobooth_apply cameratag_button">APPLY</a>');
      cancel_button = $('<a class="cameratag_photobooth_cancel">CANCEL</a>');
      filter_container.append(filter_properties).append(zoom_slider_container);
      review_edit_controls.append(filter_container).append(apply_button).append(cancel_button).append(accept_button).append(retake_button).append('<div style="clear:both"></div>');;

      review_ready_controls = $('<div class="cameratag_review_ready_controls"></div>');
      filter_selector = $('<select class="cameratag_photobooth_filter_selector"></select>');
      accept_button = $('<a class="cameratag_photobooth_accept cameratag_button">SAVE</a>');
      retake_button = $('<a class="cameratag_photobooth_retake cameratag_button">START OVER</a>');
      review_ready_controls.append(filter_selector).append(accept_button).append('<div style="clear:both"></div>'); // .append(retake_button)
      
      review_screen.append(image_frame).append(review_edit_controls).append(review_ready_controls);
    }

    // published_screen
    published_screen = $("#"+dom_id+"-published-screen").addClass("cameratag_photobooth_screen");
    if (published_screen.length == 0) {
      published_screen = $('<div class="cameratag_photobooth_published_screen cameratag_photobooth_screen"></div>');
      published_img = $('<img class="cameratag_photobooth_published_img"></img>');

      published_screen.append(published_img);
    }

    // error_screen
    error_screen = $("#"+dom_id+"-error-screen").addClass("cameratag_photobooth_screen");
    if (error_screen.length == 0) {
      error_screen = $('<div class="cameratag_photobooth_error_screen cameratag_photobooth_screen"></div>');
      error_message = $('<div class="cameratag_photobooth_error_message"></div>')

      error_screen.append(error_message);
    } else {
      error_message = $(".cameratag_photobooth_error_message")
    }

    // wait_screen
    wait_screen = $("#"+dom_id+"-wait-screen").addClass("cameratag_photobooth_screen");
    if (wait_screen.length == 0) {
      wait_screen = $('<div class="cameratag_photobooth_wait_screen cameratag_photobooth_screen"></div>');
      var spinner = $('<div class="cameratag_spinner"><img src="//'+appServer+'/assets/loading.gif"/><br/><span class="cameratag_photobooth_wait_message">'+CT_i18n[16]+'</span></div>');
      wait_screen.append(spinner);
    }
    wait_message = wait_screen.find(".cameratag_photobooth_wait_message");

    // hidden inputs
    uuid_input = $('<input type="hidden" name="'+input_name+'_uuid"></input>');
    url_input = $('<input type="hidden" name="'+input_name+'_url"></input>');

    // build the container
    container.css({width: width+"px", height: height+"px"})
    container.append(start_screen);
    container.append(mobile_start_screen);
    container.append(capture_screen);
    container.append(upload_screen);
    container.append(review_screen);
    container.append(error_screen);
    container.append(wait_screen);
    container.append(published_screen);
    container.append(uuid_input);
    container.append(url_input);
    container.append(settings_screen);

    // set font size
    font_size = parseInt($(container).height() / 14);
    if (font_size < 12) {
      font_size = 12;
    }
    $(container).css({fontSize: font_size+"px"});  

    // observe the things
    container.find(".cameratag_settings_btn").click(function(e){
      e.stopPropagation();
      self.inputSettings()
    });      

    // build the effects screen instance
    review_canvas = new ImageProcessor(review_canvas_placeholder);


    // populate the filters
    var html = '';
    for (var i = 0; i < review_canvas.filters.length; i++) {
        html += '<option value='+i+'>' + review_canvas.filters[i].name + '</option>';
    }
    $(container).find(".cameratag_photobooth_filter_selector").html(html);

    // event observers
    $(container).find(".cameratag_photobooth_capture").click(function(){
      self.connect();
    });
    $(container).find(".cameratag_photobooth_trigger").click(self.takePicture);
    $(container).find(".cameratag_photobooth_accept").click(self.publish);
    $(container).find(".cameratag_photobooth_apply").click(self.applyFilter);
    $(container).find(".cameratag_photobooth_cancel").click(self.cancelFilter);
    $(container).find(".cameratag_photobooth_retake").click(function(){
      self.back();
    });

    // filter selector
    $(container).find(".cameratag_photobooth_filter_selector").change(function(){
      review_canvas.select_filter( $(this).val() );
      review_canvas.draw(frame_data);
    });

    // drage handle for cropping
    offset_dragger.draggable({
      scroll: false,
      drag: function(e, ui){
        var left_offset = ui.position.left - dragger_container_left;
        var top_offset = ui.position.top - dragger_container_top;
        review_canvas.setOffset(left_offset, top_offset)
        review_canvas.draw();
      }
    })

    zoom_slider.slider({
      slide: function(e, ui) {
        review_canvas.setUserZoom(ui.value);
        review_canvas.draw();
      },
      change: function(e, ui) {
        review_canvas.setUserZoom(ui.value);
        review_canvas.draw();
      },
      min: 1,
      max: 3,
      value: 1,
      step: .01
    });

    // build uploader
    if (mobile_enabled) {
      create_uploader(mobile_start_screen);    
    }
    else if (start_screen.find(".cameratag_upload").length > 0) {
      create_uploader( start_screen.find(".cameratag_upload")[0] );
    }

    // accessaory interface elements
    flash = $('<div class="cameratag_photobooth_flash"></div>');
    shutter_sound = new Audio('//'+appServer+'/static/'+CameraTag.version+'/shutter.ogg');

    // add the container to the
    $(booth_el).replaceWith(container);

    // init the booth instance inside the interface
    if (mobile_enabled) {
      // do nothing
    }
    else if (webrtc_enabled) {
      booth = new WebRTCBooth(preview_canvas_placeholder);
    } else {
      booth = new FlashBooth(preview_canvas_placeholder);  
    }

    $("body").append(flash);
  }

  self.inputSettings = function() {
    if (webrtc_enabled) {
      self.loadInterface(settings_screen);
    } else if (!mobile_enabled) {
      self.loadInterface("none");
      booth.showFlashSettings();
    } else {
      console.warn("there are no input settings for mobile devices")
    }
  }

  var buildSettingsDialog = function() {
    // input settings
    navigator.mediaDevices.enumerateDevices().then(function(devices) {
      $(devices).each(function(index, device){
        if (device.kind === 'videoinput') {
          booth.cams.push(device);
        }
      })
      selected_cam_id = booth.cams[0].deviceId;

      var camera_options = $('<select class="cameratag_cam_select"></select>');
      var prompt = $('<div class="cameratag_select_prompt">'+CT_i18n[48]+'</div>');

      $(booth.cams).each(function(index, device){
        var option = $('<option value="'+device.deviceId+'">'+device.label+' ('+device.deviceId+')</option>')
        camera_options.append(option);
      })
      var close_btn = $('<div class="cameratag_save">Save</div>');

      camera_options.change(function(){
        booth.setCamera( $(this).val() );
      });
      close_btn.click(function(){
        self.loadInterface(start_screen);
      });
      settings_screen.append(prompt).append(camera_options).append("<br/>").append("<br/>").append(close_btn);

      CameraTag.fire(dom_id, "initialized");
    });
  }

  self.getPhoto = function() {
    if (state == "published") {
      return {
        url: url_input.val(),
        data: review_canvas.getFrame(),
        uuid: uuid
      }  
    } else {
      return {}
    }
  }

  self.setMetadata = function(js_object) {
    if (typeof(js_object) != "object") {
      console.warn("setMetadata only accepts Javascript Objects");
      return;
    }

    // set for future use
    metadata_object = js_object;

    // if we've already published send the data to the server
    if (state == "published") {
      var json_string = JSON.stringify(js_object);
      
      $.ajax({
        url: "//"+appServer+"/api/v"+CameraTag.version+"/cameras/"+camera_uuid+"/assets/"+uuid+"/metadata.json",
        data:{form_data: json_string},
        type:"post",
        success: function(response) {
          return true
        },
        error: function(jqXHR, textStatus, errorThrown) {
          throw_error(CT_i18n[35]);
          CameraTag.fire(dom_id, "metadataError", {
            jqXHR: jqXHR,
            textStatus: textStatus,
            errorThrown: errorThrown
          });
          return false;
        }
      })
    }
  }

  self.applyFilter = function() {
    review_canvas.applyFilter();
  }

  var resetZoom = function() {
    if (review_canvas) {
      review_canvas.setUserZoom(1);
      review_canvas.setOffset(0,0);
    }
  }

  self.cancelFilter = function() {
    resetZoom();
    review_canvas.select_filter(0);
  }

  var wait = function(message) {
    wait_message.html(message);
    self.loadInterface(wait_screen);
  }

  var error = function(message) {
    error_message.html(message);
    self.loadInterface(error_screen);
  }

  self.connect = function() {
    wait("trying to access camera");
    booth.connect();
  }

  self.disconnect = function() {
    booth.disconnect();
    connected = false;
  }

  self.takePicture = function() {
    reviewSnapshot( booth.getFrame() );
  }

  self.back = function() {
    destination = last_screen;
    last_screen = start_screen;

    container.find(".cameratag_photobooth_screen").hide();

    if (destination != "none") {
      destination.css('display','block');
    }
  }

  self.loadInterface = function(new_screen) {
    last_screen = current_screen;
    current_screen = new_screen;
    container.find(".cameratag_photobooth_screen").hide();

    if (new_screen != "none") {
      new_screen.css('display','block');
    }
  };

  self.select_filter = function(filter_index) {
    review_canvas.select_filter(filter_index);
    CameraTag.fire(dom_id, "filterSelected", filter_index);
  };

  self.publish = function(){
    CameraTag.fire(dom_id, "publishing");
    self.loadInterface(upload_screen);
    if (connected) {
      self.disconnect();  
    }
    var blob = dataURItoBlob( review_canvas.getFrame() );
    uploader.add({
      name: 'snapshots/' + uuid + '.jpg',
      file: blob,
      notSignedHeadersAtInitiate: {
         'Cache-Control': 'max-age=3600'
      },
      xAmzHeadersAtInitiate : {
         'x-amz-acl': 'public-read'
      },
      signParams: {},
      complete: function(){
        publish_asset({
          camera_uuid: camera_uuid,
          asset_uuid: uuid, 
          asset_type: "Photo",
          type: "webcam", 
          signature: signature, 
          signature_expiration: signature_expiration,
          metadata: metadata_object
          // video_name: video_name, 
          // video_description: video_description
        });
      },
      progress: function(progress) {
        upload_status.html((progress * 100).toFixed(1) + "%");
        CameraTag.fire(dom_id, "uploadProgress", progress);
      }
    });
  }

  var create_uploader = function(browse_element) {
    var upload_input = $('<input id="'+dom_id+'_upload_file" style="position:absolute;" type="file" accept="image/*">')
    $(start_screen).append(upload_input);
    $(upload_input).css({
      left: $(browse_element).offset().left - $(browse_element).offsetParent().offset().left,
      top: $(browse_element).offset().top - $(browse_element).offsetParent().offset().top,
      width: $(browse_element).width(),
      height: $(browse_element).height(),
      opacity: 0
    })
    $(browse_element).css({
      zIndex: 1
    })
    $(browse_element).click(function(e){
      if (e.target != upload_input[0]) {
        e.stopPropagation();
        $(upload_input).click();
      }
    })
    

    $(upload_input).change(function(evt){
      files = evt.target.files;

      // get file extension
      var ext = files[0].name.split(".")
      ext = ext[ext.length-1];
      ext = ext.toLowerCase();

      if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Only process image files.
        if ( !files[0].type.match('image.*') ) {
          if ( !confirm(CT_i18n[42]) ) {
            return;
          }
        }

        var reader = new FileReader();
        reader.addEventListener("load", function () {
          reviewSnapshot(reader.result);
        }, false);
        reader.readAsDataURL(files[0]);
      }
      else {
        alert('The File APIs are not fully supported in this browser.');
      }
    });
  }

  var reviewSnapshot = function(image_data) {
    state = "reviewing";
    if (connected) {
      self.disconnect();
    }
    shutter_sound.play();
    review_canvas.draw(image_data);
    self.loadInterface(review_screen);
    CameraTag.fire(dom_id, "photoTaken");
  }

  var dataURItoBlob = function(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], {type:mimeString});
  }

  init();
};
    CameraTagPhoto = function(photo_el) {
  var self = this;
  var asset_id = $(photo_el).attr("data-uuid");
  var dom_id = $(photo_el).attr("id");
  var thumbnail_size = $(photo_el).attr("data-thumb-size") || "small";
  var signature = $(photo_el).attr("data-signature");
  var expiration = $(photo_el).attr("data-signature-expiration");
  var asset;
  
  var init = function() {
    $.ajax({
      url: "//"+appServer+"/api/v"+CameraTag.version+"/assets/"+asset_id+".json",
      type: "get",
      success: function(response){
        asset = response;
        renderImage();
      }
    });

    CameraTag.photos[dom_id] = self;
  }

  var renderImage = function() {
    var asset_url;
    if (thumbnail_size == "full") {
      asset_url = asset["preview_full_thumbnail_url"]
    } else {
      asset_url = asset["preview_thumbnail_url"]
    }
    var new_img = $('<img src="'+asset_url+'?signature='+signature+'&signature_expiration='+expiration+'"></img>')
    new_img.attr("style", $(photo_el).attr("style"));
    new_img.attr("id", dom_id);
    $(photo_el).replaceWith(new_img);
  }

  init();
}
    CameraTagScreenCapture = function(el) {
  if (!webrtc_enabled) {
    console.warn("CameraTag Screen Capture is only available on browsers that support WebRTC");
    return
  }

  var self = this;
  var dom_id = $(el).attr("id");
  var app_id = $(el).attr("data-app-id");
  var signature_expiration = $(el).attr("data-signature-expiration");
  var signature = $(el).attr("data-signature");
  var user_data = $(el).attr("data-user-data");
  var name = $(el).attr("data-name");
  var description = $(el).attr("data-description");

  var uuid = generateUUID("v-");

  var uploader = new Evaporate({
     signerUrl: '//'+appServer+'/api/v'+CameraTag.version+'/videos/upload_signature',
     aws_key: 'AKIAJCHWZMZ35EB62V2A',
     bucket: 'assets.cameratag.com',
     aws_url: 'https://d2az0z6s4nrieh.cloudfront.net',
     cloudfront: true,
     logging: false
  });

  var recorder = RecordRTC(el, {
    type: 'canvas'
  });

  self.record = function() {
    recorder.startRecording();
  }

  self.reset = function() {
    uuid = generateUUID("v-");
  }

  self.stop = function() {
    recorder.stopRecording(function(videoURL) {
      //video.src = videoURL;
      var recordedBlob = recorder.getBlob();
      uploadBlob(recordedBlob);
    });
  }

  var uploadBlob = function(blob) {
    uploader.add({
      name: 'recordings/' + uuid + '.flv',
      file: blob,
      notSignedHeadersAtInitiate: {
         'Cache-Control': 'max-age=3600'
      },
      xAmzHeadersAtInitiate : {
         'x-amz-acl': 'public-read'
      },
      signParams: {},
      complete: function(){
        upload_and_publish(app_id, uuid, "upload", "", signature, signature_expiration, user_data, name, description); // publish without s3  
      },
      progress: function(progress){
        console.log(progress);
        CameraTag.fire(dom_id, "uploadProgress", progress);
        upload_status.html((progress * 100).toFixed(1) + "%");
      }
    });
  }

  CameraTag.captures[dom_id] = self;

}
// end of ScreenCapture


    //
    // Begin Dependancies
    //


    // RecordRTC
    if (webrtc_enabled) {
      function RecordRTC(mediaStream,config){function startRecording(){return config.disableLogs||console.debug("started recording "+config.type+" stream."),mediaRecorder?(mediaRecorder.clearRecordedData(),mediaRecorder.resume(),self.recordingDuration&&handleRecordingDuration(),self):(initRecorder(function(){self.recordingDuration&&handleRecordingDuration()}),self)}function initRecorder(initCallback){initCallback&&(config.initCallback=function(){initCallback(),initCallback=config.initCallback=null});var Recorder=new GetRecorderType(mediaStream,config);mediaRecorder=new Recorder(mediaStream,config),mediaRecorder.record(),config.disableLogs||console.debug("Initialized recorderType:",mediaRecorder.constructor.name,"for output-type:",config.type)}function stopRecording(callback){function _callback(){for(var item in mediaRecorder)self&&(self[item]=mediaRecorder[item]),recordRTC&&(recordRTC[item]=mediaRecorder[item]);var blob=mediaRecorder.blob;if(callback){var url=URL.createObjectURL(blob);callback(url)}blob&&!config.disableLogs&&console.debug(blob.type,"->",bytesToSize(blob.size)),config.autoWriteToDisk&&getDataURL(function(dataURL){var parameter={};parameter[config.type+"Blob"]=dataURL,DiskStorage.Store(parameter)})}if(!mediaRecorder)return console.warn(WARNING);var recordRTC=this;config.disableLogs||console.warn("Stopped recording "+config.type+" stream."),"gif"!==config.type?mediaRecorder.stop(_callback):(mediaRecorder.stop(),_callback())}function pauseRecording(){return mediaRecorder?(mediaRecorder.pause(),void(config.disableLogs||console.debug("Paused recording."))):console.warn(WARNING)}function resumeRecording(){return mediaRecorder?(mediaRecorder.resume(),void(config.disableLogs||console.debug("Resumed recording."))):console.warn(WARNING)}function readFile(_blob){postMessage((new FileReaderSync).readAsDataURL(_blob))}function getDataURL(callback,_mediaRecorder){function processInWebWorker(_function){var blob=URL.createObjectURL(new Blob([_function.toString(),"this.onmessage =  function (e) {"+_function.name+"(e.data);}"],{type:"application/javascript"})),worker=new Worker(blob);return URL.revokeObjectURL(blob),worker}if(!callback)throw"Pass a callback function over getDataURL.";var blob=_mediaRecorder?_mediaRecorder.blob:(mediaRecorder||{}).blob;if(!blob)return config.disableLogs||console.warn("Blob encoder did not yet finished its job."),void setTimeout(function(){getDataURL(callback,_mediaRecorder)},1e3);if("undefined"==typeof Worker||navigator.mozGetUserMedia){var reader=new FileReader;reader.readAsDataURL(blob),reader.onload=function(event){callback(event.target.result)}}else{var webWorker=processInWebWorker(readFile);webWorker.onmessage=function(event){callback(event.data)},webWorker.postMessage(blob)}}function handleRecordingDuration(){setTimeout(function(){stopRecording(self.onRecordingStopped)},self.recordingDuration)}if(!mediaStream)throw"MediaStream is mandatory.";config=new RecordRTCConfiguration(mediaStream,config);var mediaRecorder,self=this,WARNING='It seems that "startRecording" is not invoked for '+config.type+" recorder.",returnObject={startRecording:startRecording,stopRecording:stopRecording,pauseRecording:pauseRecording,resumeRecording:resumeRecording,initRecorder:initRecorder,setRecordingDuration:function(milliseconds,callback){if("undefined"==typeof milliseconds)throw"milliseconds is required.";if("number"!=typeof milliseconds)throw"milliseconds must be a number.";return self.recordingDuration=milliseconds,self.onRecordingStopped=callback||function(){},{onRecordingStopped:function(callback){self.onRecordingStopped=callback}}},clearRecordedData:function(){return mediaRecorder?(mediaRecorder.clearRecordedData(),void(config.disableLogs||console.debug("Cleared old recorded data."))):console.warn(WARNING)},getBlob:function(){return mediaRecorder?mediaRecorder.blob:console.warn(WARNING)},getDataURL:getDataURL,toURL:function(){return mediaRecorder?URL.createObjectURL(mediaRecorder.blob):console.warn(WARNING)},save:function(fileName){return mediaRecorder?void invokeSaveAsDialog(mediaRecorder.blob,fileName):console.warn(WARNING)},getFromDisk:function(callback){return mediaRecorder?void RecordRTC.getFromDisk(config.type,callback):console.warn(WARNING)},setAdvertisementArray:function(arrayOfWebPImages){config.advertisement=[];for(var length=arrayOfWebPImages.length,i=0;length>i;i++)config.advertisement.push({duration:i,image:arrayOfWebPImages[i]})},blob:null,bufferSize:0,sampleRate:0,buffer:null,view:null};if(!this)return self=returnObject,returnObject;for(var prop in returnObject)this[prop]=returnObject[prop];return self=this,returnObject}function RecordRTCConfiguration(mediaStream,config){return config.recorderType&&!config.type&&(config.recorderType===WhammyRecorder||config.recorderType===CanvasRecorder?config.type="video":config.recorderType===GifRecorder?config.type="gif":config.recorderType===StereoAudioRecorder?config.type="audio":config.recorderType===MediaStreamRecorder&&(mediaStream.getAudioTracks().length&&mediaStream.getVideoTracks().length?config.type="video":mediaStream.getAudioTracks().length&&!mediaStream.getVideoTracks().length?config.type="audio":!mediaStream.getAudioTracks().length&&mediaStream.getVideoTracks().length&&(config.type="audio"))),"undefined"!=typeof MediaStreamRecorder&&"undefined"!=typeof MediaRecorder&&"requestData"in MediaRecorder.prototype&&(config.mimeType||(config.mimeType="video/webm"),config.type||(config.type=config.mimeType.split("/")[0]),!config.bitsPerSecond),config.type||(config.mimeType&&(config.type=config.mimeType.split("/")[0]),config.type||(config.type="audio")),config}function GetRecorderType(mediaStream,config){var recorder;return(isChrome||isEdge||isOpera)&&(recorder=StereoAudioRecorder),"undefined"!=typeof MediaRecorder&&"requestData"in MediaRecorder.prototype&&!isChrome&&(recorder=MediaStreamRecorder),"video"===config.type&&(isChrome||isOpera)&&(recorder=WhammyRecorder),"gif"===config.type&&(recorder=GifRecorder),"canvas"===config.type&&(recorder=CanvasRecorder),isMediaRecorderCompatible()&&recorder!==CanvasRecorder&&recorder!==GifRecorder&&"undefined"!=typeof MediaRecorder&&"requestData"in MediaRecorder.prototype&&mediaStream.getVideoTracks().length&&(recorder=MediaStreamRecorder),config.recorderType&&(recorder=config.recorderType),!config.disableLogs&&recorder&&recorder.name&&console.debug("Using recorderType:",recorder.name||recorder.constructor.name),recorder}function MRecordRTC(mediaStream){this.addStream=function(_mediaStream){_mediaStream&&(mediaStream=_mediaStream)},this.mediaType={audio:!0,video:!0},this.startRecording=function(){var recorderType,mediaType=this.mediaType,mimeType=this.mimeType||{audio:null,video:null,gif:null};if("function"!=typeof mediaType.audio&&isMediaRecorderCompatible()&&mediaStream.getAudioTracks&&!mediaStream.getAudioTracks().length&&(mediaType.audio=!1),"function"!=typeof mediaType.video&&isMediaRecorderCompatible()&&mediaStream.getVideoTracks&&!mediaStream.getVideoTracks().length&&(mediaType.video=!1),!mediaType.audio&&!mediaType.video)throw"MediaStream must have either audio or video tracks.";if(mediaType.audio&&(recorderType=null,"function"==typeof mediaType.audio&&(recorderType=mediaType.audio),this.audioRecorder=new RecordRTC(mediaStream,{type:"audio",bufferSize:this.bufferSize,sampleRate:this.sampleRate,numberOfAudioChannels:this.numberOfAudioChannels||2,disableLogs:this.disableLogs,recorderType:recorderType,mimeType:mimeType.audio}),mediaType.video||this.audioRecorder.startRecording()),mediaType.video){recorderType=null,"function"==typeof mediaType.video&&(recorderType=mediaType.video);var newStream=mediaStream;if(isMediaRecorderCompatible()&&mediaType.audio&&"function"==typeof mediaType.audio){var videoTrack=mediaStream.getVideoTracks()[0];navigator.mozGetUserMedia?(newStream=new MediaStream,newStream.addTrack(videoTrack),recorderType&&recorderType===WhammyRecorder&&(recorderType=MediaStreamRecorder)):newStream=new MediaStream([videoTrack])}this.videoRecorder=new RecordRTC(newStream,{type:"video",video:this.video,canvas:this.canvas,frameInterval:this.frameInterval||10,disableLogs:this.disableLogs,recorderType:recorderType,mimeType:mimeType.video}),mediaType.audio||this.videoRecorder.startRecording()}if(mediaType.audio&&mediaType.video){var self=this;isMediaRecorderCompatible()?(self.audioRecorder=null,self.videoRecorder.startRecording()):self.videoRecorder.initRecorder(function(){self.audioRecorder.initRecorder(function(){self.videoRecorder.startRecording(),self.audioRecorder.startRecording()})})}mediaType.gif&&(recorderType=null,"function"==typeof mediaType.gif&&(recorderType=mediaType.gif),this.gifRecorder=new RecordRTC(mediaStream,{type:"gif",frameRate:this.frameRate||200,quality:this.quality||10,disableLogs:this.disableLogs,recorderType:recorderType,mimeType:mimeType.gif}),this.gifRecorder.startRecording())},this.stopRecording=function(callback){callback=callback||function(){},this.audioRecorder&&this.audioRecorder.stopRecording(function(blobURL){callback(blobURL,"audio")}),this.videoRecorder&&this.videoRecorder.stopRecording(function(blobURL){callback(blobURL,"video")}),this.gifRecorder&&this.gifRecorder.stopRecording(function(blobURL){callback(blobURL,"gif")})},this.getBlob=function(callback){var output={};return this.audioRecorder&&(output.audio=this.audioRecorder.getBlob()),this.videoRecorder&&(output.video=this.videoRecorder.getBlob()),this.gifRecorder&&(output.gif=this.gifRecorder.getBlob()),callback&&callback(output),output},this.getDataURL=function(callback){function getDataURL(blob,callback00){if("undefined"!=typeof Worker){var webWorker=processInWebWorker(function(_blob){postMessage((new FileReaderSync).readAsDataURL(_blob))});webWorker.onmessage=function(event){callback00(event.data)},webWorker.postMessage(blob)}else{var reader=new FileReader;reader.readAsDataURL(blob),reader.onload=function(event){callback00(event.target.result)}}}function processInWebWorker(_function){var url,blob=URL.createObjectURL(new Blob([_function.toString(),"this.onmessage =  function (e) {"+_function.name+"(e.data);}"],{type:"application/javascript"})),worker=new Worker(blob);if("undefined"!=typeof URL)url=URL;else{if("undefined"==typeof webkitURL)throw"Neither URL nor webkitURL detected.";url=webkitURL}return url.revokeObjectURL(blob),worker}this.getBlob(function(blob){getDataURL(blob.audio,function(_audioDataURL){getDataURL(blob.video,function(_videoDataURL){callback({audio:_audioDataURL,video:_videoDataURL})})})})},this.writeToDisk=function(){RecordRTC.writeToDisk({audio:this.audioRecorder,video:this.videoRecorder,gif:this.gifRecorder})},this.save=function(args){args=args||{audio:!0,video:!0,gif:!0},args.audio&&this.audioRecorder&&this.audioRecorder.save("string"==typeof args.audio?args.audio:""),args.video&&this.videoRecorder&&this.videoRecorder.save("string"==typeof args.video?args.video:""),args.gif&&this.gifRecorder&&this.gifRecorder.save("string"==typeof args.gif?args.gif:"")}}function bytesToSize(bytes){var k=1e3,sizes=["Bytes","KB","MB","GB","TB"];if(0===bytes)return"0 Bytes";var i=parseInt(Math.floor(Math.log(bytes)/Math.log(k)),10);return(bytes/Math.pow(k,i)).toPrecision(3)+" "+sizes[i]}function invokeSaveAsDialog(file,fileName){if(!file)throw"Blob object is required.";if(!file.type)try{file.type="video/webm"}catch(e){}var fileExtension=(file.type||"video/webm").split("/")[1];if(fileName&&-1!==fileName.indexOf(".")){var splitted=fileName.split(".");fileName=splitted[0],fileExtension=splitted[1]}var fileFullName=(fileName||Math.round(9999999999*Math.random())+888888888)+"."+fileExtension;if("undefined"!=typeof navigator.msSaveOrOpenBlob)return navigator.msSaveOrOpenBlob(file,fileFullName);if("undefined"!=typeof navigator.msSaveBlob)return navigator.msSaveBlob(file,fileFullName);var hyperlink=document.createElement("a");hyperlink.href=URL.createObjectURL(file),hyperlink.target="_blank",hyperlink.download=fileFullName,navigator.mozGetUserMedia&&(hyperlink.onclick=function(){(document.body||document.documentElement).removeChild(hyperlink)},(document.body||document.documentElement).appendChild(hyperlink));var evt=new MouseEvent("click",{view:window,bubbles:!0,cancelable:!0});hyperlink.dispatchEvent(evt),navigator.mozGetUserMedia||URL.revokeObjectURL(hyperlink.href)}function isMediaRecorderCompatible(){var isOpera=!!window.opera||navigator.userAgent.indexOf(" OPR/")>=0,isChrome=!!window.chrome&&!isOpera,isFirefox="undefined"!=typeof window.InstallTrigger;if(isFirefox)return!0;var verOffset,ix,nAgt=(navigator.appVersion,navigator.userAgent),fullVersion=""+parseFloat(navigator.appVersion),majorVersion=parseInt(navigator.appVersion,10);return(isChrome||isOpera)&&(verOffset=nAgt.indexOf("Chrome"),fullVersion=nAgt.substring(verOffset+7)),-1!==(ix=fullVersion.indexOf(";"))&&(fullVersion=fullVersion.substring(0,ix)),-1!==(ix=fullVersion.indexOf(" "))&&(fullVersion=fullVersion.substring(0,ix)),majorVersion=parseInt(""+fullVersion,10),isNaN(majorVersion)&&(fullVersion=""+parseFloat(navigator.appVersion),majorVersion=parseInt(navigator.appVersion,10)),majorVersion>=49}function MediaStreamRecorder(mediaStream,config){function isMediaStreamActive(){if("active"in mediaStream){if(!mediaStream.active)return!1}else if("ended"in mediaStream&&mediaStream.ended)return!1;return!0}var self=this;if(config=config||{mimeType:"video/webm"},"audio"===config.type){if(mediaStream.getVideoTracks().length&&mediaStream.getAudioTracks().length){var stream;navigator.mozGetUserMedia?(stream=new MediaStream,stream.addTrack(mediaStream.getAudioTracks()[0])):stream=new MediaStream(mediaStream.getAudioTracks()),mediaStream=stream}config.mimeType&&-1!==config.mimeType.indexOf("audio")||(config.mimeType=isChrome?"audio/webm":"audio/ogg")}this.record=function(){self.blob=null;var recorderHints=config;config.disableLogs||console.log("Passing following config over MediaRecorder API.",recorderHints),mediaRecorder&&(mediaRecorder=null),isChrome&&!isMediaRecorderCompatible()&&(recorderHints="video/vp8"),mediaRecorder=new MediaRecorder(mediaStream,recorderHints),"canRecordMimeType"in mediaRecorder&&mediaRecorder.canRecordMimeType(config.mimeType)===!1&&(config.disableLogs||console.warn("MediaRecorder API seems unable to record mimeType:",config.mimeType)),mediaRecorder.ignoreMutedMedia=config.ignoreMutedMedia||!1,mediaRecorder.ondataavailable=function(e){self.dontFireOnDataAvailableEvent||!e.data||!e.data.size||e.data.size<100||self.blob||(self.blob=config.getNativeBlob?e.data:new Blob([e.data],{type:config.mimeType||"video/webm"}),self.recordingCallback&&(self.recordingCallback(self.blob),self.recordingCallback=null))},mediaRecorder.onerror=function(error){config.disableLogs||("InvalidState"===error.name?console.error("The MediaRecorder is not in a state in which the proposed operation is allowed to be executed."):"OutOfMemory"===error.name?console.error("The UA has exhaused the available memory. User agents SHOULD provide as much additional information as possible in the message attribute."):"IllegalStreamModification"===error.name?console.error("A modification to the stream has occurred that makes it impossible to continue recording. An example would be the addition of a Track while recording is occurring. User agents SHOULD provide as much additional information as possible in the message attribute."):"OtherRecordingError"===error.name?console.error("Used for an fatal error other than those listed above. User agents SHOULD provide as much additional information as possible in the message attribute."):"GenericError"===error.name?console.error("The UA cannot provide the codec or recording option that has been requested.",error):console.error("MediaRecorder Error",error)),"inactive"!==mediaRecorder.state&&"stopped"!==mediaRecorder.state&&mediaRecorder.stop()},mediaRecorder.start(36e5),config.onAudioProcessStarted&&config.onAudioProcessStarted(),config.initCallback&&config.initCallback()},this.stop=function(callback){mediaRecorder&&(this.recordingCallback=callback||function(){},"recording"===mediaRecorder.state&&(mediaRecorder.requestData(),mediaRecorder.stop()))},this.pause=function(){mediaRecorder&&"recording"===mediaRecorder.state&&mediaRecorder.pause()},this.resume=function(){if(this.dontFireOnDataAvailableEvent){this.dontFireOnDataAvailableEvent=!1;var disableLogs=config.disableLogs;return config.disableLogs=!0,this.record(),void(config.disableLogs=disableLogs)}mediaRecorder&&"paused"===mediaRecorder.state&&mediaRecorder.resume()},this.clearRecordedData=function(){mediaRecorder&&(this.pause(),this.dontFireOnDataAvailableEvent=!0,this.stop())};var mediaRecorder,self=this;!function looper(){return mediaRecorder?isMediaStreamActive()===!1?(config.disableLogs||console.log("MediaStream seems stopped."),void self.stop()):void setTimeout(looper,1e3):void 0}()}function StereoAudioRecorder(mediaStream,config){function isMediaStreamActive(){if("active"in mediaStream){if(!mediaStream.active)return!1}else if("ended"in mediaStream&&mediaStream.ended)return!1;return!0}function mergeLeftRightBuffers(config,callback){function mergeAudioBuffers(config,cb){function mergeBuffers(channelBuffer,rLength){for(var result=new Float64Array(rLength),offset=0,lng=channelBuffer.length,i=0;lng>i;i++){var buffer=channelBuffer[i];result.set(buffer,offset),offset+=buffer.length}return result}function interleave(leftChannel,rightChannel){for(var length=leftChannel.length+rightChannel.length,result=new Float64Array(length),inputIndex=0,index=0;length>index;)result[index++]=leftChannel[inputIndex],result[index++]=rightChannel[inputIndex],inputIndex++;return result}function writeUTFBytes(view,offset,string){for(var lng=string.length,i=0;lng>i;i++)view.setUint8(offset+i,string.charCodeAt(i))}var numberOfAudioChannels=config.numberOfAudioChannels,leftBuffers=config.leftBuffers.slice(0),rightBuffers=config.rightBuffers.slice(0),sampleRate=config.sampleRate,internalInterleavedLength=config.internalInterleavedLength;2===numberOfAudioChannels&&(leftBuffers=mergeBuffers(leftBuffers,internalInterleavedLength),rightBuffers=mergeBuffers(rightBuffers,internalInterleavedLength)),1===numberOfAudioChannels&&(leftBuffers=mergeBuffers(leftBuffers,internalInterleavedLength));var interleaved;2===numberOfAudioChannels&&(interleaved=interleave(leftBuffers,rightBuffers)),1===numberOfAudioChannels&&(interleaved=leftBuffers);var interleavedLength=interleaved.length,resultingBufferLength=44+2*interleavedLength,buffer=new ArrayBuffer(resultingBufferLength),view=new DataView(buffer);writeUTFBytes(view,0,"RIFF"),view.setUint32(4,44+2*interleavedLength,!0),writeUTFBytes(view,8,"WAVE"),writeUTFBytes(view,12,"fmt "),view.setUint32(16,16,!0),view.setUint16(20,1,!0),view.setUint16(22,numberOfAudioChannels,!0),view.setUint32(24,sampleRate,!0),view.setUint32(28,2*sampleRate,!0),view.setUint16(32,2*numberOfAudioChannels,!0),view.setUint16(34,16,!0),writeUTFBytes(view,36,"data"),view.setUint32(40,2*interleavedLength,!0);for(var lng=interleavedLength,index=44,volume=1,i=0;lng>i;i++)view.setInt16(index,interleaved[i]*(32767*volume),!0),index+=2;return cb?cb({buffer:buffer,view:view}):void postMessage({buffer:buffer,view:view})}if(!isChrome)return void mergeAudioBuffers(config,function(data){callback(data.buffer,data.view)});var webWorker=processInWebWorker(mergeAudioBuffers);webWorker.onmessage=function(event){callback(event.data.buffer,event.data.view),URL.revokeObjectURL(webWorker.workerURL)},webWorker.postMessage(config)}function processInWebWorker(_function){var workerURL=URL.createObjectURL(new Blob([_function.toString(),";this.onmessage =  function (e) {"+_function.name+"(e.data);}"],{type:"application/javascript"})),worker=new Worker(workerURL);return worker.workerURL=workerURL,worker}function onAudioProcessDataAvailable(e){if(!isPaused){if(isMediaStreamActive()===!1&&(config.disableLogs||console.log("MediaStream seems stopped."),jsAudioNode.disconnect(),recording=!1),!recording)return void audioInput.disconnect();isAudioProcessStarted||(isAudioProcessStarted=!0,config.onAudioProcessStarted&&config.onAudioProcessStarted(),config.initCallback&&config.initCallback());var left=e.inputBuffer.getChannelData(0);if(leftchannel.push(new Float32Array(left)),2===numberOfAudioChannels){var right=e.inputBuffer.getChannelData(1);rightchannel.push(new Float32Array(right))}recordingLength+=bufferSize}}if(!mediaStream.getAudioTracks().length)throw"Your stream has no audio tracks.";config=config||{};var jsAudioNode,self=this,leftchannel=[],rightchannel=[],recording=!1,recordingLength=0,numberOfAudioChannels=2;config.leftChannel===!0&&(numberOfAudioChannels=1),1===config.numberOfAudioChannels&&(numberOfAudioChannels=1),config.disableLogs||console.debug("StereoAudioRecorder is set to record number of channels: ",numberOfAudioChannels),this.record=function(){if(isMediaStreamActive()===!1)throw"Please make sure MediaStream is active.";leftchannel.length=rightchannel.length=0,recordingLength=0,audioInput&&audioInput.connect(jsAudioNode),isAudioProcessStarted=isPaused=!1,recording=!0},this.stop=function(callback){recording=!1,mergeLeftRightBuffers({sampleRate:sampleRate,numberOfAudioChannels:numberOfAudioChannels,internalInterleavedLength:recordingLength,leftBuffers:leftchannel,rightBuffers:1===numberOfAudioChannels?[]:rightchannel},function(buffer,view){self.blob=new Blob([view],{type:"audio/wav"}),self.buffer=new ArrayBuffer(view.buffer.byteLength),self.view=view,self.sampleRate=sampleRate,self.bufferSize=bufferSize,self.length=recordingLength,callback&&callback(),isAudioProcessStarted=!1})},Storage.AudioContextConstructor||(Storage.AudioContextConstructor=new Storage.AudioContext);var context=Storage.AudioContextConstructor,audioInput=context.createMediaStreamSource(mediaStream),legalBufferValues=[0,256,512,1024,2048,4096,8192,16384],bufferSize="undefined"==typeof config.bufferSize?4096:config.bufferSize;if(-1===legalBufferValues.indexOf(bufferSize)&&(config.disableLogs||console.warn("Legal values for buffer-size are "+JSON.stringify(legalBufferValues,null,"  "))),context.createJavaScriptNode)jsAudioNode=context.createJavaScriptNode(bufferSize,numberOfAudioChannels,numberOfAudioChannels);else{if(!context.createScriptProcessor)throw"WebAudio API has no support on this browser.";jsAudioNode=context.createScriptProcessor(bufferSize,numberOfAudioChannels,numberOfAudioChannels)}audioInput.connect(jsAudioNode),config.bufferSize||(bufferSize=jsAudioNode.bufferSize);var sampleRate="undefined"!=typeof config.sampleRate?config.sampleRate:context.sampleRate||44100;(22050>sampleRate||sampleRate>96e3)&&(config.disableLogs||console.warn("sample-rate must be under range 22050 and 96000.")),config.disableLogs||(console.log("sample-rate",sampleRate),console.log("buffer-size",bufferSize));var isPaused=!1;this.pause=function(){isPaused=!0},this.resume=function(){if(isMediaStreamActive()===!1)throw"Please make sure MediaStream is active.";return recording?void(isPaused=!1):(config.disableLogs||console.info("Seems recording has been restarted."),void this.record())},this.clearRecordedData=function(){this.pause(),leftchannel.length=rightchannel.length=0,recordingLength=0};var isAudioProcessStarted=!1;jsAudioNode.onaudioprocess=onAudioProcessDataAvailable,jsAudioNode.connect(context.destination)}function CanvasRecorder(htmlElement,config){function cloneCanvas(){var newCanvas=document.createElement("canvas"),context=newCanvas.getContext("2d");return newCanvas.width=htmlElement.width,newCanvas.height=htmlElement.height,context.drawImage(htmlElement,0,0),newCanvas}function drawCanvasFrame(){if(isPausedRecording)return lastTime=(new Date).getTime(),setTimeout(drawCanvasFrame,500);if("canvas"===htmlElement.nodeName.toLowerCase()){var duration=(new Date).getTime()-lastTime;return lastTime=(new Date).getTime(),whammy.frames.push({image:cloneCanvas(),duration:duration}),void(isRecording&&setTimeout(drawCanvasFrame,config.frameInterval))}html2canvas(htmlElement,{grabMouse:"undefined"==typeof config.showMousePointer||config.showMousePointer,onrendered:function(canvas){var duration=(new Date).getTime()-lastTime;return duration?(lastTime=(new Date).getTime(),whammy.frames.push({image:canvas.toDataURL("image/webp",1),duration:duration}),void(isRecording&&setTimeout(drawCanvasFrame,config.frameInterval))):setTimeout(drawCanvasFrame,config.frameInterval)}})}if("undefined"==typeof html2canvas&&"canvas"!==htmlElement.nodeName.toLowerCase())throw"Please link: //cdn.webrtc-experiment.com/screenshot.js";config=config||{},config.frameInterval||(config.frameInterval=10);var isCanvasSupportsStreamCapturing=!1;["captureStream","mozCaptureStream","webkitCaptureStream"].forEach(function(item){item in document.createElement("canvas")&&(isCanvasSupportsStreamCapturing=!0)}),(window.webkitRTCPeerConnection||window.webkitGetUserMedia)&&(isCanvasSupportsStreamCapturing=!1);var globalCanvas,globalContext,mediaStreamRecorder;isCanvasSupportsStreamCapturing?(config.disableLogs||console.debug("Your browser supports both MediRecorder API and canvas.captureStream!"),globalCanvas=document.createElement("canvas"),globalCanvas.width=htmlElement.clientWidth||window.innerWidth,globalCanvas.height=htmlElement.clientHeight||window.innerHeight,globalCanvas.style="top: -9999999; left: -99999999; visibility:hidden; position:absoluted; display: none;",(document.body||document.documentElement).appendChild(globalCanvas),globalContext=globalCanvas.getContext("2d")):navigator.mozGetUserMedia&&(config.disableLogs||alert("Canvas recording is NOT supported in Firefox."));var isRecording;this.record=function(){if(isRecording=!0,isCanvasSupportsStreamCapturing){var canvasMediaStream;"captureStream"in globalCanvas?canvasMediaStream=globalCanvas.captureStream(25):"mozCaptureStream"in globalCanvas?canvasMediaStream=globalCanvas.captureStream(25):"webkitCaptureStream"in globalCanvas&&(canvasMediaStream=globalCanvas.captureStream(25));try{var mdStream=new MediaStream;mdStream.addTrack(canvasMediaStream.getVideoTracks()[0]),canvasMediaStream=mdStream}catch(e){}if(!canvasMediaStream)throw"captureStream API are NOT available.";mediaStreamRecorder=new MediaStreamRecorder(canvasMediaStream,{mimeType:"video/webm"}),mediaStreamRecorder.record()}else whammy.frames=[],lastTime=(new Date).getTime(),drawCanvasFrame();config.initCallback&&config.initCallback()},this.getWebPImages=function(callback){if("canvas"!==htmlElement.nodeName.toLowerCase())return void callback();var framesLength=whammy.frames.length;whammy.frames.forEach(function(frame,idx){var framesRemaining=framesLength-idx;document.title=framesRemaining+"/"+framesLength+" frames remaining",config.onEncodingCallback&&config.onEncodingCallback(framesRemaining,framesLength);var webp=frame.image.toDataURL("image/webp",1);whammy.frames[idx].image=webp}),document.title="Generating WebM",callback()},this.stop=function(callback){isRecording=!1;var that=this;if(isCanvasSupportsStreamCapturing&&mediaStreamRecorder){return void mediaStreamRecorder.stop(function(){for(var prop in mediaStreamRecorder)self[prop]=mediaStreamRecorder[prop];callback&&callback(that.blob)})}this.getWebPImages(function(){whammy.compile(function(blob){document.title="Recording finished!",that.blob=blob,that.blob.forEach&&(that.blob=new Blob([],{type:"video/webm"})),callback&&callback(that.blob),whammy.frames=[]})})};var isPausedRecording=!1;this.pause=function(){isPausedRecording=!0},this.resume=function(){isPausedRecording=!1,isRecording||this.record()},this.clearRecordedData=function(){this.pause(),whammy.frames=[]};var lastTime=(new Date).getTime(),whammy=new Whammy.Video(100)}function WhammyRecorder(mediaStream,config){function drawFrames(frameInterval){frameInterval="undefined"!=typeof frameInterval?frameInterval:10;var duration=(new Date).getTime()-lastTime;return duration?isPausedRecording?(lastTime=(new Date).getTime(),setTimeout(drawFrames,100)):(lastTime=(new Date).getTime(),video.paused&&video.play(),context.drawImage(video,0,0,canvas.width,canvas.height),whammy.frames.push({duration:duration,image:canvas.toDataURL("image/webp")}),void(isStopDrawing||setTimeout(drawFrames,frameInterval,frameInterval))):setTimeout(drawFrames,frameInterval,frameInterval)}function asyncLoop(o){var i=-1,length=o.length,loop=function(){return i++,i===length?void o.callback():void o.functionToLoop(loop,i)};loop()}function dropBlackFrames(_frames,_framesToCheck,_pixTolerance,_frameTolerance,callback){var localCanvas=document.createElement("canvas");localCanvas.width=canvas.width,localCanvas.height=canvas.height;var context2d=localCanvas.getContext("2d"),resultFrames=[],checkUntilNotBlack=-1===_framesToCheck,endCheckFrame=_framesToCheck&&_framesToCheck>0&&_framesToCheck<=_frames.length?_framesToCheck:_frames.length,sampleColor={r:0,g:0,b:0},maxColorDifference=Math.sqrt(Math.pow(255,2)+Math.pow(255,2)+Math.pow(255,2)),pixTolerance=_pixTolerance&&_pixTolerance>=0&&1>=_pixTolerance?_pixTolerance:0,frameTolerance=_frameTolerance&&_frameTolerance>=0&&1>=_frameTolerance?_frameTolerance:0,doNotCheckNext=!1;asyncLoop({length:endCheckFrame,functionToLoop:function(loop,f){var matchPixCount,endPixCheck,maxPixCount,finishImage=function(){!doNotCheckNext&&maxPixCount*frameTolerance>=maxPixCount-matchPixCount||(checkUntilNotBlack&&(doNotCheckNext=!0),resultFrames.push(_frames[f])),loop()};if(doNotCheckNext)finishImage();else{var image=new Image;image.onload=function(){context2d.drawImage(image,0,0,canvas.width,canvas.height);var imageData=context2d.getImageData(0,0,canvas.width,canvas.height);matchPixCount=0,endPixCheck=imageData.data.length,maxPixCount=imageData.data.length/4;for(var pix=0;endPixCheck>pix;pix+=4){var currentColor={r:imageData.data[pix],g:imageData.data[pix+1],b:imageData.data[pix+2]},colorDifference=Math.sqrt(Math.pow(currentColor.r-sampleColor.r,2)+Math.pow(currentColor.g-sampleColor.g,2)+Math.pow(currentColor.b-sampleColor.b,2));maxColorDifference*pixTolerance>=colorDifference&&matchPixCount++}finishImage()},image.src=_frames[f].image}},callback:function(){resultFrames=resultFrames.concat(_frames.slice(endCheckFrame)),resultFrames.length<=0&&resultFrames.push(_frames[_frames.length-1]),callback(resultFrames)}})}config=config||{},config.frameInterval||(config.frameInterval=10),config.disableLogs||console.log("Using frames-interval:",config.frameInterval),this.record=function(){config.width||(config.width=320),config.height||(config.height=240),config.video||(config.video={width:config.width,height:config.height}),config.canvas||(config.canvas={width:config.width,height:config.height}),canvas.width=config.canvas.width,canvas.height=config.canvas.height,context=canvas.getContext("2d"),config.video&&config.video instanceof HTMLVideoElement?(video=config.video.cloneNode(),config.initCallback&&config.initCallback()):(video=document.createElement("video"),"undefined"!=typeof video.srcObject?video.srcObject=mediaStream:video.src=URL.createObjectURL(mediaStream),video.onloadedmetadata=function(){config.initCallback&&config.initCallback()},video.width=config.video.width,video.height=config.video.height),video.muted=!0,video.play(),lastTime=(new Date).getTime(),whammy=new Whammy.Video,config.disableLogs||(console.log("canvas resolutions",canvas.width,"*",canvas.height),console.log("video width/height",video.width||canvas.width,"*",video.height||canvas.height)),drawFrames(config.frameInterval)};var isStopDrawing=!1;this.stop=function(callback){isStopDrawing=!0;var _this=this;setTimeout(function(){dropBlackFrames(whammy.frames,-1,null,null,function(frames){whammy.frames=frames,config.advertisement&&config.advertisement.length&&(whammy.frames=config.advertisement.concat(whammy.frames)),whammy.compile(function(blob){_this.blob=blob,_this.blob.forEach&&(_this.blob=new Blob([],{type:"video/webm"})),callback&&callback(_this.blob)})})},10)};var isPausedRecording=!1;this.pause=function(){isPausedRecording=!0},this.resume=function(){isPausedRecording=!1,isStopDrawing&&this.record()},this.clearRecordedData=function(){this.pause(),whammy.frames=[]};var video,lastTime,whammy,canvas=document.createElement("canvas"),context=canvas.getContext("2d")}function GifRecorder(mediaStream,config){if("undefined"==typeof GIFEncoder)throw"Please link: https://cdn.webrtc-experiment.com/gif-recorder.js";config=config||{};var isHTMLObject=mediaStream instanceof CanvasRenderingContext2D||mediaStream instanceof HTMLCanvasElement;this.record=function(){function drawVideoFrame(time){return isPausedRecording?setTimeout(function(){drawVideoFrame(time)},100):(lastAnimationFrame=requestAnimationFrame(drawVideoFrame),void 0===typeof lastFrameTime&&(lastFrameTime=time),void(90>time-lastFrameTime||(!isHTMLObject&&video.paused&&video.play(),isHTMLObject||context.drawImage(video,0,0,canvas.width,canvas.height),config.onGifPreview&&config.onGifPreview(canvas.toDataURL("image/png")),gifEncoder.addFrame(context),lastFrameTime=time)))}isHTMLObject||(config.width||(config.width=video.offsetWidth||320),this.height||(config.height=video.offsetHeight||240),config.video||(config.video={width:config.width,height:config.height}),config.canvas||(config.canvas={width:config.width,height:config.height}),canvas.width=config.canvas.width,canvas.height=config.canvas.height,video.width=config.video.width,video.height=config.video.height),gifEncoder=new GIFEncoder,gifEncoder.setRepeat(0),gifEncoder.setDelay(config.frameRate||200),gifEncoder.setQuality(config.quality||10),gifEncoder.start(),startTime=Date.now();lastAnimationFrame=requestAnimationFrame(drawVideoFrame),config.initCallback&&config.initCallback()},this.stop=function(){lastAnimationFrame&&cancelAnimationFrame(lastAnimationFrame),endTime=Date.now(),this.blob=new Blob([new Uint8Array(gifEncoder.stream().bin)],{type:"image/gif"}),gifEncoder.stream().bin=[]};var isPausedRecording=!1;this.pause=function(){isPausedRecording=!0},this.resume=function(){isPausedRecording=!1},this.clearRecordedData=function(){gifEncoder&&(this.pause(),gifEncoder.stream().bin=[])};var canvas=document.createElement("canvas"),context=canvas.getContext("2d");if(isHTMLObject&&(mediaStream instanceof CanvasRenderingContext2D?(context=mediaStream,canvas=context.canvas):mediaStream instanceof HTMLCanvasElement&&(context=mediaStream.getContext("2d"),canvas=mediaStream)),!isHTMLObject){var video=document.createElement("video");video.muted=!0,video.autoplay=!0,"undefined"!=typeof video.srcObject?video.srcObject=mediaStream:video.src=URL.createObjectURL(mediaStream),video.play()}var startTime,endTime,lastFrameTime,gifEncoder,lastAnimationFrame=null}if(RecordRTC.getFromDisk=function(type,callback){if(!callback)throw"callback is mandatory.";console.log("Getting recorded "+("all"===type?"blobs":type+" blob ")+" from disk!"),DiskStorage.Fetch(function(dataURL,_type){"all"!==type&&_type===type+"Blob"&&callback&&callback(dataURL),"all"===type&&callback&&callback(dataURL,_type.replace("Blob",""))})},RecordRTC.writeToDisk=function(options){console.log("Writing recorded blob(s) to disk!"),options=options||{},options.audio&&options.video&&options.gif?options.audio.getDataURL(function(audioDataURL){options.video.getDataURL(function(videoDataURL){options.gif.getDataURL(function(gifDataURL){DiskStorage.Store({audioBlob:audioDataURL,videoBlob:videoDataURL,gifBlob:gifDataURL})})})}):options.audio&&options.video?options.audio.getDataURL(function(audioDataURL){options.video.getDataURL(function(videoDataURL){DiskStorage.Store({audioBlob:audioDataURL,videoBlob:videoDataURL})})}):options.audio&&options.gif?options.audio.getDataURL(function(audioDataURL){options.gif.getDataURL(function(gifDataURL){DiskStorage.Store({audioBlob:audioDataURL,gifBlob:gifDataURL})})}):options.video&&options.gif?options.video.getDataURL(function(videoDataURL){options.gif.getDataURL(function(gifDataURL){DiskStorage.Store({videoBlob:videoDataURL,gifBlob:gifDataURL})})}):options.audio?options.audio.getDataURL(function(audioDataURL){DiskStorage.Store({audioBlob:audioDataURL})}):options.video?options.video.getDataURL(function(videoDataURL){DiskStorage.Store({videoBlob:videoDataURL})}):options.gif&&options.gif.getDataURL(function(gifDataURL){DiskStorage.Store({gifBlob:gifDataURL})})},"undefined"!=typeof module&&(module.exports=RecordRTC),"function"==typeof define&&define.amd&&define("RecordRTC",[],function(){return RecordRTC}),MRecordRTC.getFromDisk=RecordRTC.getFromDisk,MRecordRTC.writeToDisk=RecordRTC.writeToDisk,"undefined"!=typeof RecordRTC&&(RecordRTC.MRecordRTC=MRecordRTC),"undefined"==typeof window&&"undefined"!=typeof global){global.navigator={userAgent:""};}var requestAnimationFrame=window.requestAnimationFrame;"undefined"==typeof requestAnimationFrame&&("undefined"!=typeof webkitRequestAnimationFrame&&(requestAnimationFrame=webkitRequestAnimationFrame),"undefined"!=typeof mozRequestAnimationFrame&&(requestAnimationFrame=mozRequestAnimationFrame));var cancelAnimationFrame=window.cancelAnimationFrame;"undefined"==typeof cancelAnimationFrame&&("undefined"!=typeof webkitCancelAnimationFrame&&(cancelAnimationFrame=webkitCancelAnimationFrame),"undefined"!=typeof mozCancelAnimationFrame&&(cancelAnimationFrame=mozCancelAnimationFrame));var AudioContext=window.AudioContext;"undefined"==typeof AudioContext&&("undefined"!=typeof webkitAudioContext&&(AudioContext=webkitAudioContext),"undefined"!=typeof mozAudioContext&&(AudioContext=mozAudioContext));var URL=window.URL;if("undefined"==typeof URL&&"undefined"!=typeof webkitURL&&(URL=webkitURL),"undefined"==typeof navigator)throw'Please make sure to define a global variable named as "navigator"';"undefined"!=typeof navigator.webkitGetUserMedia&&(navigator.getUserMedia=navigator.webkitGetUserMedia),"undefined"!=typeof navigator.mozGetUserMedia&&(navigator.getUserMedia=navigator.mozGetUserMedia);var isEdge=!(-1===navigator.userAgent.indexOf("Edge")||!navigator.msSaveBlob&&!navigator.msSaveOrOpenBlob),isOpera=!!window.opera||-1!==navigator.userAgent.indexOf("OPR/"),isChrome=!isOpera&&!isEdge&&!!navigator.webkitGetUserMedia,MediaStream=window.MediaStream;"undefined"==typeof MediaStream&&"undefined"!=typeof webkitMediaStream&&(MediaStream=webkitMediaStream),"undefined"!=typeof MediaStream&&("getVideoTracks"in MediaStream.prototype||(MediaStream.prototype.getVideoTracks=function(){if(!this.getTracks)return[];var tracks=[];return this.getTracks.forEach(function(track){-1!==track.kind.toString().indexOf("video")&&tracks.push(track)}),tracks},MediaStream.prototype.getAudioTracks=function(){if(!this.getTracks)return[];var tracks=[];return this.getTracks.forEach(function(track){-1!==track.kind.toString().indexOf("audio")&&tracks.push(track)}),tracks}),"stop"in MediaStream.prototype||(MediaStream.prototype.stop=function(){this.getAudioTracks().forEach(function(track){track.stop&&track.stop()}),this.getVideoTracks().forEach(function(track){track.stop&&track.stop()})}));var Storage={};"undefined"!=typeof AudioContext?Storage.AudioContext=AudioContext:"undefined"!=typeof webkitAudioContext&&(Storage.AudioContext=webkitAudioContext),"undefined"!=typeof RecordRTC&&(RecordRTC.Storage=Storage),"undefined"!=typeof RecordRTC&&(RecordRTC.MediaStreamRecorder=MediaStreamRecorder),"undefined"!=typeof RecordRTC&&(RecordRTC.StereoAudioRecorder=StereoAudioRecorder),"undefined"!=typeof RecordRTC&&(RecordRTC.CanvasRecorder=CanvasRecorder),"undefined"!=typeof RecordRTC&&(RecordRTC.WhammyRecorder=WhammyRecorder);var Whammy=function(){function WhammyVideo(duration){this.frames=[],this.duration=duration||1,this.quality=.8}function processInWebWorker(_function){var blob=URL.createObjectURL(new Blob([_function.toString(),"this.onmessage =  function (e) {"+_function.name+"(e.data);}"],{type:"application/javascript"})),worker=new Worker(blob);return URL.revokeObjectURL(blob),worker}function whammyInWebWorker(frames){function ArrayToWebM(frames){var info=checkFrames(frames);if(!info)return[];for(var clusterMaxDuration=3e4,EBML=[{id:440786851,data:[{data:1,id:17030},{data:1,id:17143},{data:4,id:17138},{data:8,id:17139},{data:"webm",id:17026},{data:2,id:17031},{data:2,id:17029}]},{id:408125543,data:[{id:357149030,data:[{data:1e6,id:2807729},{data:"whammy",id:19840},{data:"whammy",id:22337},{data:doubleToString(info.duration),id:17545}]},{id:374648427,data:[{id:174,data:[{data:1,id:215},{data:1,id:29637},{data:0,id:156},{data:"und",id:2274716},{data:"V_VP8",id:134},{data:"VP8",id:2459272},{data:1,id:131},{id:224,data:[{data:info.width,id:176},{data:info.height,id:186}]}]}]}]}],frameNumber=0,clusterTimecode=0;frameNumber<frames.length;){var clusterFrames=[],clusterDuration=0;do clusterFrames.push(frames[frameNumber]),clusterDuration+=frames[frameNumber].duration,frameNumber++;while(frameNumber<frames.length&&clusterMaxDuration>clusterDuration);var clusterCounter=0,cluster={id:524531317,data:getClusterData(clusterTimecode,clusterCounter,clusterFrames)};EBML[1].data.push(cluster),clusterTimecode+=clusterDuration}return generateEBML(EBML)}function getClusterData(clusterTimecode,clusterCounter,clusterFrames){return[{data:clusterTimecode,id:231}].concat(clusterFrames.map(function(webp){var block=makeSimpleBlock({discardable:0,frame:webp.data.slice(4),invisible:0,keyframe:1,lacing:0,trackNum:1,timecode:Math.round(clusterCounter)});return clusterCounter+=webp.duration,{data:block,id:163}}))}function checkFrames(frames){if(!frames[0])return void postMessage({error:"Something went wrong. Maybe WebP format is not supported in the current browser."});for(var width=frames[0].width,height=frames[0].height,duration=frames[0].duration,i=1;i<frames.length;i++)duration+=frames[i].duration;return{duration:duration,width:width,height:height}}function numToBuffer(num){for(var parts=[];num>0;)parts.push(255&num),num>>=8;return new Uint8Array(parts.reverse())}function strToBuffer(str){return new Uint8Array(str.split("").map(function(e){return e.charCodeAt(0)}))}function bitsToBuffer(bits){var data=[],pad=bits.length%8?new Array(9-bits.length%8).join("0"):"";bits=pad+bits;for(var i=0;i<bits.length;i+=8)data.push(parseInt(bits.substr(i,8),2));return new Uint8Array(data)}function generateEBML(json){for(var ebml=[],i=0;i<json.length;i++){var data=json[i].data;"object"==typeof data&&(data=generateEBML(data)),"number"==typeof data&&(data=bitsToBuffer(data.toString(2))),"string"==typeof data&&(data=strToBuffer(data));var len=data.size||data.byteLength||data.length,zeroes=Math.ceil(Math.ceil(Math.log(len)/Math.log(2))/8),sizeToString=len.toString(2),padded=new Array(7*zeroes+7+1-sizeToString.length).join("0")+sizeToString,size=new Array(zeroes).join("0")+"1"+padded;ebml.push(numToBuffer(json[i].id)),ebml.push(bitsToBuffer(size)),ebml.push(data)}return new Blob(ebml,{type:"video/webm"})}function makeSimpleBlock(data){var flags=0;if(data.keyframe&&(flags|=128),data.invisible&&(flags|=8),data.lacing&&(flags|=data.lacing<<1),data.discardable&&(flags|=1),data.trackNum>127)throw"TrackNumber > 127 not supported";var out=[128|data.trackNum,data.timecode>>8,255&data.timecode,flags].map(function(e){return String.fromCharCode(e)}).join("")+data.frame;return out}function parseWebP(riff){for(var VP8=riff.RIFF[0].WEBP[0],frameStart=VP8.indexOf("*"),i=0,c=[];4>i;i++)c[i]=VP8.charCodeAt(frameStart+3+i);var width,height,tmp;return tmp=c[1]<<8|c[0],width=16383&tmp,tmp=c[3]<<8|c[2],height=16383&tmp,{width:width,height:height,data:VP8,riff:riff}}function getStrLength(string,offset){return parseInt(string.substr(offset+4,4).split("").map(function(i){var unpadded=i.charCodeAt(0).toString(2);return new Array(8-unpadded.length+1).join("0")+unpadded}).join(""),2)}function parseRIFF(string){for(var offset=0,chunks={};offset<string.length;){var id=string.substr(offset,4),len=getStrLength(string,offset),data=string.substr(offset+4+4,len);offset+=8+len,chunks[id]=chunks[id]||[],"RIFF"===id||"LIST"===id?chunks[id].push(parseRIFF(data)):chunks[id].push(data)}return chunks}function doubleToString(num){return[].slice.call(new Uint8Array(new Float64Array([num]).buffer),0).map(function(e){return String.fromCharCode(e)}).reverse().join("")}var webm=new ArrayToWebM(frames.map(function(frame){var webp=parseWebP(parseRIFF(atob(frame.image.slice(23))));return webp.duration=frame.duration,webp}));postMessage(webm)}return WhammyVideo.prototype.add=function(frame,duration){if("canvas"in frame&&(frame=frame.canvas),"toDataURL"in frame&&(frame=frame.toDataURL("image/webp",this.quality)),!/^data:image\/webp;base64,/gi.test(frame))throw"Input must be formatted properly as a base64 encoded DataURI of type image/webp";this.frames.push({image:frame,duration:duration||this.duration})},WhammyVideo.prototype.compile=function(callback){var webWorker=processInWebWorker(whammyInWebWorker);webWorker.onmessage=function(event){return event.data.error?void console.error(event.data.error):void callback(event.data)},webWorker.postMessage(this.frames)},{Video:WhammyVideo}}();"undefined"!=typeof RecordRTC&&(RecordRTC.Whammy=Whammy);var DiskStorage={init:function(){function createObjectStore(dataBase){dataBase.createObjectStore(self.dataStoreName)}function putInDB(){function getFromStore(portionName){transaction.objectStore(self.dataStoreName).get(portionName).onsuccess=function(event){self.callback&&self.callback(event.target.result,portionName)}}var transaction=db.transaction([self.dataStoreName],"readwrite");self.videoBlob&&transaction.objectStore(self.dataStoreName).put(self.videoBlob,"videoBlob"),self.gifBlob&&transaction.objectStore(self.dataStoreName).put(self.gifBlob,"gifBlob"),self.audioBlob&&transaction.objectStore(self.dataStoreName).put(self.audioBlob,"audioBlob"),getFromStore("audioBlob"),getFromStore("videoBlob"),getFromStore("gifBlob")}var self=this;if("undefined"==typeof indexedDB||"undefined"==typeof indexedDB.open)return void console.error("IndexedDB API are not available in this browser.");var db,dbVersion=1,dbName=this.dbName||location.href.replace(/\/|:|#|%|\.|\[|\]/g,""),request=indexedDB.open(dbName,dbVersion);request.onerror=self.onError,request.onsuccess=function(){if(db=request.result,db.onerror=self.onError,db.setVersion)if(db.version!==dbVersion){var setVersion=db.setVersion(dbVersion);setVersion.onsuccess=function(){createObjectStore(db),putInDB()}}else putInDB();else putInDB()},request.onupgradeneeded=function(event){createObjectStore(event.target.result)}},Fetch:function(callback){return this.callback=callback,this.init(),this},Store:function(config){return this.audioBlob=config.audioBlob,this.videoBlob=config.videoBlob,this.gifBlob=config.gifBlob,this.init(),this},onError:function(error){console.error(JSON.stringify(error,null," "))},dataStoreName:"recordRTC",dbName:null};"undefined"!=typeof RecordRTC&&(RecordRTC.DiskStorage=DiskStorage),"undefined"!=typeof RecordRTC&&(RecordRTC.GifRecorder=GifRecorder);

      //function h2clog(e){if(_html2canvas.logging&&window.console&&window.console.log){window.console.log(e)}}function backgroundBoundsFactory(e,t,n,r,i,s){var o=_html2canvas.Util.getCSS(t,e,i),u,a,f,l;if(o.length===1){l=o[0];o=[];o[0]=l;o[1]=l}if(o[0].toString().indexOf("%")!==-1){f=parseFloat(o[0])/100;a=n.width*f;if(e!=="backgroundSize"){a-=(s||r).width*f}}else{if(e==="backgroundSize"){if(o[0]==="auto"){a=r.width}else{if(o[0].match(/contain|cover/)){var c=_html2canvas.Util.resizeBounds(r.width,r.height,n.width,n.height,o[0]);a=c.width;u=c.height}else{a=parseInt(o[0],10)}}}else{a=parseInt(o[0],10)}}if(o[1]==="auto"){u=a/r.width*r.height}else if(o[1].toString().indexOf("%")!==-1){f=parseFloat(o[1])/100;u=n.height*f;if(e!=="backgroundSize"){u-=(s||r).height*f}}else{u=parseInt(o[1],10)}return[a,u]}function h2czContext(e){return{zindex:e,children:[]}}function h2cRenderContext(e,t){var n=[];return{storage:n,width:e,height:t,clip:function(){n.push({type:"function",name:"clip",arguments:arguments})},translate:function(){n.push({type:"function",name:"translate",arguments:arguments})},fill:function(){n.push({type:"function",name:"fill",arguments:arguments})},save:function(){n.push({type:"function",name:"save",arguments:arguments})},restore:function(){n.push({type:"function",name:"restore",arguments:arguments})},fillRect:function(){n.push({type:"function",name:"fillRect",arguments:arguments})},createPattern:function(){n.push({type:"function",name:"createPattern",arguments:arguments})},drawShape:function(){var e=[];n.push({type:"function",name:"drawShape",arguments:e});return{moveTo:function(){e.push({name:"moveTo",arguments:arguments})},lineTo:function(){e.push({name:"lineTo",arguments:arguments})},arcTo:function(){e.push({name:"arcTo",arguments:arguments})},bezierCurveTo:function(){e.push({name:"bezierCurveTo",arguments:arguments})},quadraticCurveTo:function(){e.push({name:"quadraticCurveTo",arguments:arguments})}}},drawImage:function(){n.push({type:"function",name:"drawImage",arguments:arguments})},fillText:function(){n.push({type:"function",name:"fillText",arguments:arguments})},setVariable:function(e,t){n.push({type:"variable",name:e,arguments:t})}}}function getMouseXY(e){if(IE){coordX=event.clientX+document.body.scrollLeft;coordY=event.clientY+document.body.scrollTop}else{coordX=e.pageX;coordY=e.pageY}if(coordX<0){coordX=0}if(coordY<0){coordY=0}return true}var _html2canvas={},previousElement,computedCSS,html2canvas;_html2canvas.Util={};_html2canvas.Util.trimText=function(e){return function(t){if(e){return e.apply(t)}else{return((t||"")+"").replace(/^\s+|\s+$/g,"")}}}(String.prototype.trim);_html2canvas.Util.parseBackgroundImage=function(e){var t=" \r\n  ",n,r,i,s,o,u=[],a,f=0,l=0,c,h;var p=function(){if(n){if(r.substr(0,1)==='"'){r=r.substr(1,r.length-2)}if(r){h.push(r)}if(n.substr(0,1)==="-"&&(s=n.indexOf("-",1)+1)>0){i=n.substr(0,s);n=n.substr(s)}u.push({prefix:i,method:n.toLowerCase(),value:o,args:h})}h=[];n=i=r=o=""};p();for(var d=0,v=e.length;d<v;d++){a=e[d];if(f===0&&t.indexOf(a)>-1){continue}switch(a){case'"':if(!c){c=a}else if(c===a){c=null}break;case"(":if(c){break}else if(f===0){f=1;o+=a;continue}else{l++}break;case")":if(c){break}else if(f===1){if(l===0){f=0;o+=a;p();continue}else{l--}}break;case",":if(c){break}else if(f===0){p();continue}else if(f===1){if(l===0&&!n.match(/^url$/i)){h.push(r);r="";o+=a;continue}}break}o+=a;if(f===0){n+=a}else{r+=a}}p();return u};_html2canvas.Util.Bounds=function(t){var n,r={};if(t.getBoundingClientRect){n=t.getBoundingClientRect();r.top=n.top;r.bottom=n.bottom||n.top+n.height;r.left=n.left;r.width=n.width||n.right-n.left;r.height=n.height||n.bottom-n.top;return r}};_html2canvas.Util.getCSS=function(e,t,n){function s(t,n){var r=e.runtimeStyle&&e.runtimeStyle[t],i,s=e.style;if(!/^-?[0-9]+\.?[0-9]*(?:px)?$/i.test(n)&&/^-?\d/.test(n)){i=s.left;if(r){e.runtimeStyle.left=e.currentStyle.left}s.left=t==="fontSize"?"1em":n||0;n=s.pixelLeft+"px";s.left=i;if(r){e.runtimeStyle.left=r}}if(!/^(thin|medium|thick)$/i.test(n)){return Math.round(parseFloat(n))+"px"}return n}var r,i=t.match(/^background(Size|Position)$/);if(previousElement!==e){computedCSS=document.defaultView.getComputedStyle(e,null)}r=computedCSS[t];if(i){r=(r||"").split(",");r=r[n||0]||r[0]||"auto";r=_html2canvas.Util.trimText(r).split(" ");if(t==="backgroundSize"&&(!r[0]||r[0].match(/cover|contain|auto/))){}else{r[0]=r[0].indexOf("%")===-1?s(t+"X",r[0]):r[0];if(r[1]===undefined){if(t==="backgroundSize"){r[1]="auto";return r}else{r[1]=r[0]}}r[1]=r[1].indexOf("%")===-1?s(t+"Y",r[1]):r[1]}}else if(/border(Top|Bottom)(Left|Right)Radius/.test(t)){var o=r.split(" ");if(o.length<=1){o[1]=o[0]}o[0]=parseInt(o[0],10);o[1]=parseInt(o[1],10);r=o}return r};_html2canvas.Util.resizeBounds=function(e,t,n,r,i){var s=n/r,o=e/t,u,a;if(!i||i==="auto"){u=n;a=r}else{if(s<o^i==="contain"){a=r;u=r*o}else{u=n;a=n/o}}return{width:u,height:a}};_html2canvas.Util.BackgroundPosition=function(e,t,n,r,i){var s=backgroundBoundsFactory("backgroundPosition",e,t,n,r,i);return{left:s[0],top:s[1]}};_html2canvas.Util.BackgroundSize=function(e,t,n,r){var i=backgroundBoundsFactory("backgroundSize",e,t,n,r);return{width:i[0],height:i[1]}};_html2canvas.Util.Extend=function(e,t){for(var n in e){if(e.hasOwnProperty(n)){t[n]=e[n]}}return t};_html2canvas.Util.Children=function(e){var t;try{t=e.nodeName&&e.nodeName.toUpperCase()==="IFRAME"?e.contentDocument||e.contentWindow.document:function(e){var t=[];if(e!==null){(function(e,t){var n=e.length,r=0;if(typeof t.length==="number"){for(var i=t.length;r<i;r++){e[n++]=t[r]}}else{while(t[r]!==undefined){e[n++]=t[r++]}}e.length=n;return e})(t,e)}return t}(e.childNodes)}catch(n){h2clog("html2canvas.Util.Children failed with exception: "+n.message);t=[]}return t};_html2canvas.Util.Font=function(){var e={};return function(t,n,r){if(e[t+"-"+n]!==undefined){return e[t+"-"+n]}var i=r.createElement("div"),s=r.createElement("img"),o=r.createElement("span"),u="Hidden Text",a,f,l;i.style.visibility="hidden";i.style.fontFamily=t;i.style.fontSize=n;i.style.margin=0;i.style.padding=0;r.body.appendChild(i);s.src="data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=";s.width=1;s.height=1;s.style.margin=0;s.style.padding=0;s.style.verticalAlign="baseline";o.style.fontFamily=t;o.style.fontSize=n;o.style.margin=0;o.style.padding=0;o.appendChild(r.createTextNode(u));i.appendChild(o);i.appendChild(s);a=s.offsetTop-o.offsetTop+1;i.removeChild(o);i.appendChild(r.createTextNode(u));i.style.lineHeight="normal";s.style.verticalAlign="super";f=s.offsetTop-i.offsetTop+1;l={baseline:a,lineWidth:1,middle:f};e[t+"-"+n]=l;r.body.removeChild(i);return l}}();(function(){_html2canvas.Generate={};var e=[/^(-webkit-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,/^(-o-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,/^(-webkit-gradient)\((linear|radial),\s((?:\d{1,3}%?)\s(?:\d{1,3}%?),\s(?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)\-]+)\)$/,/^(-moz-linear-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)]+)\)$/,/^(-webkit-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z\-]+)([\w\d\.\s,%\(\)]+)\)$/,/^(-moz-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s?([a-z\-]*)([\w\d\.\s,%\(\)]+)\)$/,/^(-o-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z\-]+)([\w\d\.\s,%\(\)]+)\)$/];_html2canvas.Generate.parseGradient=function(t,n){var r,i,s=e.length,o,u,a,f,l,c,h,p,d,v;for(i=0;i<s;i+=1){o=t.match(e[i]);if(o){break}}if(o){switch(o[1]){case"-webkit-linear-gradient":case"-o-linear-gradient":r={type:"linear",x0:null,y0:null,x1:null,y1:null,colorStops:[]};a=o[2].match(/\w+/g);if(a){f=a.length;for(i=0;i<f;i+=1){switch(a[i]){case"top":r.y0=0;r.y1=n.height;break;case"right":r.x0=n.width;r.x1=0;break;case"bottom":r.y0=n.height;r.y1=0;break;case"left":r.x0=0;r.x1=n.width;break}}}if(r.x0===null&&r.x1===null){r.x0=r.x1=n.width/2}if(r.y0===null&&r.y1===null){r.y0=r.y1=n.height/2}a=o[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g);if(a){f=a.length;l=1/Math.max(f-1,1);for(i=0;i<f;i+=1){c=a[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/);if(c[2]){u=parseFloat(c[2]);if(c[3]==="%"){u/=100}else{u/=n.width}}else{u=i*l}r.colorStops.push({color:c[1],stop:u})}}break;case"-webkit-gradient":r={type:o[2]==="radial"?"circle":o[2],x0:0,y0:0,x1:0,y1:0,colorStops:[]};a=o[3].match(/(\d{1,3})%?\s(\d{1,3})%?,\s(\d{1,3})%?\s(\d{1,3})%?/);if(a){r.x0=a[1]*n.width/100;r.y0=a[2]*n.height/100;r.x1=a[3]*n.width/100;r.y1=a[4]*n.height/100}a=o[4].match(/((?:from|to|color-stop)\((?:[0-9\.]+,\s)?(?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)\))+/g);if(a){f=a.length;for(i=0;i<f;i+=1){c=a[i].match(/(from|to|color-stop)\(([0-9\.]+)?(?:,\s)?((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\)/);u=parseFloat(c[2]);if(c[1]==="from"){u=0}if(c[1]==="to"){u=1}r.colorStops.push({color:c[3],stop:u})}}break;case"-moz-linear-gradient":r={type:"linear",x0:0,y0:0,x1:0,y1:0,colorStops:[]};a=o[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);if(a){r.x0=a[1]*n.width/100;r.y0=a[2]*n.height/100;r.x1=n.width-r.x0;r.y1=n.height-r.y0}a=o[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}%)?)+/g);if(a){f=a.length;l=1/Math.max(f-1,1);for(i=0;i<f;i+=1){c=a[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/);if(c[2]){u=parseFloat(c[2]);if(c[3]){u/=100}}else{u=i*l}r.colorStops.push({color:c[1],stop:u})}}break;case"-webkit-radial-gradient":case"-moz-radial-gradient":case"-o-radial-gradient":r={type:"circle",x0:0,y0:0,x1:n.width,y1:n.height,cx:0,cy:0,rx:0,ry:0,colorStops:[]};a=o[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);if(a){r.cx=a[1]*n.width/100;r.cy=a[2]*n.height/100}a=o[3].match(/\w+/);c=o[4].match(/[a-z\-]*/);if(a&&c){switch(c[0]){case"farthest-corner":case"cover":case"":h=Math.sqrt(Math.pow(r.cx,2)+Math.pow(r.cy,2));p=Math.sqrt(Math.pow(r.cx,2)+Math.pow(r.y1-r.cy,2));d=Math.sqrt(Math.pow(r.x1-r.cx,2)+Math.pow(r.y1-r.cy,2));v=Math.sqrt(Math.pow(r.x1-r.cx,2)+Math.pow(r.cy,2));r.rx=r.ry=Math.max(h,p,d,v);break;case"closest-corner":h=Math.sqrt(Math.pow(r.cx,2)+Math.pow(r.cy,2));p=Math.sqrt(Math.pow(r.cx,2)+Math.pow(r.y1-r.cy,2));d=Math.sqrt(Math.pow(r.x1-r.cx,2)+Math.pow(r.y1-r.cy,2));v=Math.sqrt(Math.pow(r.x1-r.cx,2)+Math.pow(r.cy,2));r.rx=r.ry=Math.min(h,p,d,v);break;case"farthest-side":if(a[0]==="circle"){r.rx=r.ry=Math.max(r.cx,r.cy,r.x1-r.cx,r.y1-r.cy)}else{r.type=a[0];r.rx=Math.max(r.cx,r.x1-r.cx);r.ry=Math.max(r.cy,r.y1-r.cy)}break;case"closest-side":case"contain":if(a[0]==="circle"){r.rx=r.ry=Math.min(r.cx,r.cy,r.x1-r.cx,r.y1-r.cy)}else{r.type=a[0];r.rx=Math.min(r.cx,r.x1-r.cx);r.ry=Math.min(r.cy,r.y1-r.cy)}break}}a=o[5].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g);if(a){f=a.length;l=1/Math.max(f-1,1);for(i=0;i<f;i+=1){c=a[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/);if(c[2]){u=parseFloat(c[2]);if(c[3]==="%"){u/=100}else{u/=n.width}}else{u=i*l}r.colorStops.push({color:c[1],stop:u})}}break}}return r};_html2canvas.Generate.Gradient=function(e,t){if(t.width===0||t.height===0){return}var n=document.createElement("canvas"),r=n.getContext("2d"),i,s,o,u;n.width=t.width;n.height=t.height;i=_html2canvas.Generate.parseGradient(e,t);if(i){if(i.type==="linear"){s=r.createLinearGradient(i.x0,i.y0,i.x1,i.y1);for(o=0,u=i.colorStops.length;o<u;o+=1){try{s.addColorStop(i.colorStops[o].stop,i.colorStops[o].color)}catch(a){h2clog(["failed to add color stop: ",a,"; tried to add: ",i.colorStops[o],"; stop: ",o,"; in: ",e])}}r.fillStyle=s;r.fillRect(0,0,t.width,t.height)}else if(i.type==="circle"){s=r.createRadialGradient(i.cx,i.cy,0,i.cx,i.cy,i.rx);for(o=0,u=i.colorStops.length;o<u;o+=1){try{s.addColorStop(i.colorStops[o].stop,i.colorStops[o].color)}catch(a){h2clog(["failed to add color stop: ",a,"; tried to add: ",i.colorStops[o],"; stop: ",o,"; in: ",e])}}r.fillStyle=s;r.fillRect(0,0,t.width,t.height)}else if(i.type==="ellipse"){var f=document.createElement("canvas"),l=f.getContext("2d"),c=Math.max(i.rx,i.ry),h=c*2,p;f.width=f.height=h;s=l.createRadialGradient(i.rx,i.ry,0,i.rx,i.ry,c);for(o=0,u=i.colorStops.length;o<u;o+=1){try{s.addColorStop(i.colorStops[o].stop,i.colorStops[o].color)}catch(a){h2clog(["failed to add color stop: ",a,"; tried to add: ",i.colorStops[o],"; stop: ",o,"; in: ",e])}}l.fillStyle=s;l.fillRect(0,0,h,h);r.fillStyle=i.colorStops[o-1].color;r.fillRect(0,0,n.width,n.height);r.drawImage(f,i.cx-i.rx,i.cy-i.ry,2*i.rx,2*i.ry)}}return n};_html2canvas.Generate.ListAlpha=function(e){var t="",n;do{n=e%26;t=String.fromCharCode(n+64)+t;e=e/26}while(e*26>26);return t};_html2canvas.Generate.ListRoman=function(e){var t=["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"],n=[1e3,900,500,400,100,90,50,40,10,9,5,4,1],r="",i,s=t.length;if(e<=0||e>=4e3){return e}for(i=0;i<s;i+=1){while(e>=n[i]){e-=n[i];r+=t[i]}}return r}})();_html2canvas.Parse=function(e,t){function c(){return Math.max(Math.max(i.body.scrollWidth,i.documentElement.scrollWidth),Math.max(i.body.offsetWidth,i.documentElement.offsetWidth),Math.max(i.body.clientWidth,i.documentElement.clientWidth))}function h(){return Math.max(Math.max(i.body.scrollHeight,i.documentElement.scrollHeight),Math.max(i.body.offsetHeight,i.documentElement.offsetHeight),Math.max(i.body.clientHeight,i.documentElement.clientHeight))}function p(e,t){var n=parseInt(a(e,t),10);return isNaN(n)?0:n}function d(e,t,n,i,s,o){if(o!=="transparent"){e.setVariable("fillStyle",o);e.fillRect(t,n,i,s);r+=1}}function v(e,t){switch(t){case"lowercase":return e.toLowerCase();case"capitalize":return e.replace(/(^|\s|:|-|\(|\))([a-z])/g,function(e,t,n){if(e.length>0){return t+n.toUpperCase()}});case"uppercase":return e.toUpperCase();default:return e}}function m(e){return/^(normal|none|0px)$/.test(e)}function g(e,t,n,i){if(e!==null&&_html2canvas.Util.trimText(e).length>0){i.fillText(e,t,n);r+=1}}function y(e,t,n,r){var s=false,o=a(t,"fontWeight"),u=a(t,"fontFamily"),f=a(t,"fontSize");switch(parseInt(o,10)){case 401:o="bold";break;case 400:o="normal";break}e.setVariable("fillStyle",r);e.setVariable("font",[a(t,"fontStyle"),a(t,"fontVariant"),o,f,u].join(" "));e.setVariable("textAlign",s?"right":"left");if(n!=="none"){return _html2canvas.Util.Font(u,f,i)}}function b(e,t,n,r,i){switch(t){case"underline":d(e,n.left,Math.round(n.top+r.baseline+r.lineWidth),n.width,1,i);break;case"overline":d(e,n.left,Math.round(n.top),n.width,1,i);break;case"line-through":d(e,n.left,Math.ceil(n.top+r.middle+r.lineWidth),n.width,1,i);break}}function w(e,t,n,r){var i;if(s.rangeBounds){if(n!=="none"||_html2canvas.Util.trimText(t).length!==0){i=E(t,e.node,e.textOffset)}e.textOffset+=t.length}else if(e.node&&typeof e.node.nodeValue==="string"){var o=r?e.node.splitText(t.length):null;i=S(e.node);e.node=o}return i}function E(e,t,n){var r=i.createRange();r.setStart(t,n);r.setEnd(t,n+e.length);return r.getBoundingClientRect()}function S(e){var t=e.parentNode,n=i.createElement("wrapper"),r=e.cloneNode(true);n.appendChild(e.cloneNode(true));t.replaceChild(n,e);var s=_html2canvas.Util.Bounds(n);t.replaceChild(r,n);return s}function x(e,n,r){var i=r.ctx,s=a(e,"color"),o=a(e,"textDecoration"),u=a(e,"textAlign"),f,l,c={node:n,textOffset:0};if(_html2canvas.Util.trimText(n.nodeValue).length>0){n.nodeValue=v(n.nodeValue,a(e,"textTransform"));u=u.replace(["-webkit-auto"],["auto"]);l=!t.letterRendering&&/^(left|right|justify|auto)$/.test(u)&&m(a(e,"letterSpacing"))?n.nodeValue.split(/(\b| )/):n.nodeValue.split("");f=y(i,e,o,s);if(t.chinese){l.forEach(function(e,t){if(/.*[\u4E00-\u9FA5].*$/.test(e)){e=e.split("");e.unshift(t,1);l.splice.apply(l,e)}})}l.forEach(function(e,t){var n=w(c,e,o,t<l.length-1);if(n){g(e,n.left,n.bottom,i);b(i,o,n,f,s)}})}}function T(e,t){var n=i.createElement("boundelement"),r,s;n.style.display="inline";r=e.style.listStyleType;e.style.listStyleType="none";n.appendChild(i.createTextNode(t));e.insertBefore(n,e.firstChild);s=_html2canvas.Util.Bounds(n);e.removeChild(n);e.style.listStyleType=r;return s}function N(e){var t=-1,n=1,r=e.parentNode.childNodes;if(e.parentNode){while(r[++t]!==e){if(r[t].nodeType===1){n++}}return n}else{return-1}}function C(e,t){var n=N(e),r;switch(t){case"decimal":r=n;break;case"decimal-leading-zero":r=n.toString().length===1?n="0"+n.toString():n.toString();break;case"upper-roman":r=_html2canvas.Generate.ListRoman(n);break;case"lower-roman":r=_html2canvas.Generate.ListRoman(n).toLowerCase();break;case"lower-alpha":r=_html2canvas.Generate.ListAlpha(n).toLowerCase();break;case"upper-alpha":r=_html2canvas.Generate.ListAlpha(n);break}r+=". ";return r}function k(e,t,n){var r,i,s=t.ctx,o=a(e,"listStyleType"),u;if(/^(decimal|decimal-leading-zero|upper-alpha|upper-latin|upper-roman|lower-alpha|lower-greek|lower-latin|lower-roman)$/i.test(o)){i=C(e,o);u=T(e,i);y(s,e,"none",a(e,"color"));if(a(e,"listStylePosition")==="inside"){s.setVariable("textAlign","left");r=n.left}else{return}g(i,r,u.bottom,s)}}function L(t){var n=e[t];if(n&&n.succeeded===true){return n.img}else{return false}}function A(e,t){var n=Math.max(e.left,t.left),r=Math.max(e.top,t.top),i=Math.min(e.left+e.width,t.left+t.width),s=Math.min(e.top+e.height,t.top+t.height);return{left:n,top:r,width:i-n,height:s-r}}function O(e,t){var n;if(!t){n=h2czContext(0);return n}if(e!=="auto"){n=h2czContext(e);t.children.push(n);return n}return t}function M(e,t,n,r,i){var s=p(t,"paddingLeft"),o=p(t,"paddingTop"),u=p(t,"paddingRight"),a=p(t,"paddingBottom");W(e,n,0,0,n.width,n.height,r.left+s+i[3].width,r.top+o+i[0].width,r.width-(i[1].width+i[3].width+s+u),r.height-(i[0].width+i[2].width+o+a))}function _(e){return["Top","Right","Bottom","Left"].map(function(t){return{width:p(e,"border"+t+"Width"),color:a(e,"border"+t+"Color")}})}function D(e){return["TopLeft","TopRight","BottomRight","BottomLeft"].map(function(t){return a(e,"border"+t+"Radius")})}function H(e,t,n,r){var i=function(e,t,n){return{x:e.x+(t.x-e.x)*n,y:e.y+(t.y-e.y)*n}};return{start:e,startControl:t,endControl:n,end:r,subdivide:function(s){var o=i(e,t,s),u=i(t,n,s),a=i(n,r,s),f=i(o,u,s),l=i(u,a,s),c=i(f,l,s);return[H(e,o,f,c),H(c,l,a,r)]},curveTo:function(e){e.push(["bezierCurve",t.x,t.y,n.x,n.y,r.x,r.y])},curveToReversed:function(r){r.push(["bezierCurve",n.x,n.y,t.x,t.y,e.x,e.y])}}}function B(e,t,n,r,i,s,o){if(t[0]>0||t[1]>0){e.push(["line",r[0].start.x,r[0].start.y]);r[0].curveTo(e);r[1].curveTo(e)}else{e.push(["line",s,o])}if(n[0]>0||n[1]>0){e.push(["line",i[0].start.x,i[0].start.y])}}function j(e,t,n,r,i,s,o){var u=[];if(t[0]>0||t[1]>0){u.push(["line",r[1].start.x,r[1].start.y]);r[1].curveTo(u)}else{u.push(["line",e.c1[0],e.c1[1]])}if(n[0]>0||n[1]>0){u.push(["line",s[0].start.x,s[0].start.y]);s[0].curveTo(u);u.push(["line",o[0].end.x,o[0].end.y]);o[0].curveToReversed(u)}else{u.push(["line",e.c2[0],e.c2[1]]);u.push(["line",e.c3[0],e.c3[1]])}if(t[0]>0||t[1]>0){u.push(["line",i[1].end.x,i[1].end.y]);i[1].curveToReversed(u)}else{u.push(["line",e.c4[0],e.c4[1]])}return u}function F(e,t,n){var r=e.left,i=e.top,s=e.width,o=e.height,u=t[0][0],a=t[0][1],f=t[1][0],l=t[1][1],c=t[2][0],h=t[2][1],p=t[3][0],d=t[3][1],v=s-f,m=o-c,g=s-h,y=o-d;return{topLeftOuter:P(r,i,u,a).topLeft.subdivide(.5),topLeftInner:P(r+n[3].width,i+n[0].width,Math.max(0,u-n[3].width),Math.max(0,a-n[0].width)).topLeft.subdivide(.5),topRightOuter:P(r+v,i,f,l).topRight.subdivide(.5),topRightInner:P(r+Math.min(v,s+n[3].width),i+n[0].width,v>s+n[3].width?0:f-n[3].width,l-n[0].width).topRight.subdivide(.5),bottomRightOuter:P(r+g,i+m,h,c).bottomRight.subdivide(.5),bottomRightInner:P(r+Math.min(g,s+n[3].width),i+Math.min(m,o+n[0].width),Math.max(0,h-n[1].width),Math.max(0,c-n[2].width)).bottomRight.subdivide(.5),bottomLeftOuter:P(r,i+y,p,d).bottomLeft.subdivide(.5),bottomLeftInner:P(r+n[3].width,i+y,Math.max(0,p-n[3].width),Math.max(0,d-n[2].width)).bottomLeft.subdivide(.5)}}function I(e,t,n,r,i){var s=a(e,"backgroundClip"),o=[];switch(s){case"content-box":case"padding-box":B(o,r[0],r[1],t.topLeftInner,t.topRightInner,i.left+n[3].width,i.top+n[0].width);B(o,r[1],r[2],t.topRightInner,t.bottomRightInner,i.left+i.width-n[1].width,i.top+n[0].width);B(o,r[2],r[3],t.bottomRightInner,t.bottomLeftInner,i.left+i.width-n[1].width,i.top+i.height-n[2].width);B(o,r[3],r[0],t.bottomLeftInner,t.topLeftInner,i.left+n[3].width,i.top+i.height-n[2].width);break;default:B(o,r[0],r[1],t.topLeftOuter,t.topRightOuter,i.left,i.top);B(o,r[1],r[2],t.topRightOuter,t.bottomRightOuter,i.left+i.width,i.top);B(o,r[2],r[3],t.bottomRightOuter,t.bottomLeftOuter,i.left+i.width,i.top+i.height);B(o,r[3],r[0],t.bottomLeftOuter,t.topLeftOuter,i.left,i.top+i.height);break}return o}function q(e,t,n){var r=t.left,i=t.top,s=t.width,o=t.height,u,a,f,l,c,h,p=D(e),d=F(t,p,n),v={clip:I(e,d,n,p,t),borders:[]};for(u=0;u<4;u++){if(n[u].width>0){a=r;f=i;l=s;c=o-n[2].width;switch(u){case 0:c=n[0].width;h=j({c1:[a,f],c2:[a+l,f],c3:[a+l-n[1].width,f+c],c4:[a+n[3].width,f+c]},p[0],p[1],d.topLeftOuter,d.topLeftInner,d.topRightOuter,d.topRightInner);break;case 1:a=r+s-n[1].width;l=n[1].width;h=j({c1:[a+l,f],c2:[a+l,f+c+n[2].width],c3:[a,f+c],c4:[a,f+n[0].width]},p[1],p[2],d.topRightOuter,d.topRightInner,d.bottomRightOuter,d.bottomRightInner);break;case 2:f=f+o-n[2].width;c=n[2].width;h=j({c1:[a+l,f+c],c2:[a,f+c],c3:[a+n[3].width,f],c4:[a+l-n[2].width,f]},p[2],p[3],d.bottomRightOuter,d.bottomRightInner,d.bottomLeftOuter,d.bottomLeftInner);break;case 3:l=n[3].width;h=j({c1:[a,f+c+n[2].width],c2:[a,f],c3:[a+l,f+n[0].width],c4:[a+l,f+c]},p[3],p[0],d.bottomLeftOuter,d.bottomLeftInner,d.topLeftOuter,d.topLeftInner);break}v.borders.push({args:h,color:n[u].color})}}return v}function R(e,t){var n=e.drawShape();t.forEach(function(e,t){n[t===0?"moveTo":e[0]+"To"].apply(null,e.slice(1))});return n}function U(e,t,n){if(n!=="transparent"){e.setVariable("fillStyle",n);R(e,t);e.fill();r+=1}}function z(e,t,n){var r=i.createElement("valuewrap"),s=["lineHeight","textAlign","fontFamily","color","fontSize","paddingLeft","paddingTop","width","height","border","borderLeftWidth","borderTopWidth"],o,f;s.forEach(function(t){try{r.style[t]=a(e,t)}catch(n){h2clog("html2canvas: Parse: Exception caught in renderFormValue: "+n.message)}});r.style.borderColor="black";r.style.borderStyle="solid";r.style.display="block";r.style.position="absolute";if(/^(submit|reset|button|text|password)$/.test(e.type)||e.nodeName==="SELECT"){r.style.lineHeight=a(e,"height")}r.style.top=t.top+"px";r.style.left=t.left+"px";o=e.nodeName==="SELECT"?(e.options[e.selectedIndex]||0).text:e.value;if(!o){o=e.placeholder}f=i.createTextNode(o);r.appendChild(f);u.appendChild(r);x(e,f,n);u.removeChild(r)}function W(e){e.drawImage.apply(e,Array.prototype.slice.call(arguments,1));r+=1}function X(e,t){var n=window.getComputedStyle(e,t);if(!n||!n.content||n.content==="none"||n.content==="-moz-alt-content"){return}var r=n.content+"",i=r.substr(0,1);if(i===r.substr(r.length-1)&&i.match(/'|"/)){r=r.substr(1,r.length-2)}var s=r.substr(0,3)==="url",o=document.createElement(s?"img":"span");o.className=f+"-before "+f+"-after";Object.keys(n).filter(V).forEach(function(e){o.style[e]=n[e]});if(s){o.src=_html2canvas.Util.parseBackgroundImage(r)[0].args[0]}else{o.innerHTML=r}return o}function V(e){return isNaN(window.parseInt(e,10))}function $(e,t){var n=X(e,":before"),r=X(e,":after");if(!n&&!r){return}if(n){e.className+=" "+f+"-before";e.parentNode.insertBefore(n,e);st(n,t,true);e.parentNode.removeChild(n);e.className=e.className.replace(f+"-before","").trim()}if(r){e.className+=" "+f+"-after";e.appendChild(r);st(r,t,true);e.removeChild(r);e.className=e.className.replace(f+"-after","").trim()}}function J(e,t,n,r){var i=Math.round(r.left+n.left),s=Math.round(r.top+n.top);e.createPattern(t);e.translate(i,s);e.fill();e.translate(-i,-s)}function K(e,t,n,r,i,s,o,u){var a=[];a.push(["line",Math.round(i),Math.round(s)]);a.push(["line",Math.round(i+o),Math.round(s)]);a.push(["line",Math.round(i+o),Math.round(u+s)]);a.push(["line",Math.round(i),Math.round(u+s)]);R(e,a);e.save();e.clip();J(e,t,n,r);e.restore()}function Q(e,t,n){d(e,t.left,t.top,t.width,t.height,n)}function G(e,t,n,r,i){var s=_html2canvas.Util.BackgroundSize(e,t,r,i),o=_html2canvas.Util.BackgroundPosition(e,t,r,i,s),u=a(e,"backgroundRepeat").split(",").map(function(e){return e.trim()});r=Z(r,s);u=u[i]||u[0];switch(u){case"repeat-x":K(n,r,o,t,t.left,t.top+o.top,99999,r.height);break;case"repeat-y":K(n,r,o,t,t.left+o.left,t.top,r.width,99999);break;case"no-repeat":K(n,r,o,t,t.left+o.left,t.top+o.top,r.width,r.height);break;default:J(n,r,o,{top:t.top,left:t.left,width:r.width,height:r.height});break}}function Y(e,t,n){var r=a(e,"backgroundImage"),i=_html2canvas.Util.parseBackgroundImage(r),s,o=i.length;while(o--){r=i[o];if(!r.args||r.args.length===0){continue}var u=r.method==="url"?r.args[0]:r.value;s=L(u);if(s){G(e,t,n,s,o)}else{h2clog("html2canvas: Error loading background:",r)}}}function Z(e,t){if(e.width===t.width&&e.height===t.height){return e}var n,r=i.createElement("canvas");r.width=t.width;r.height=t.height;n=r.getContext("2d");W(n,e,0,0,e.width,e.height,0,0,t.width,t.height);return r}function et(e,t,n){var r=a(t,"opacity")*(n?n.opacity:1);e.setVariable("globalAlpha",r);return r}function tt(e,n,r){var i=h2cRenderContext(!n?c():r.width,!n?h():r.height),s={ctx:i,zIndex:O(a(e,"zIndex"),n?n.zIndex:null),opacity:et(i,e,n),cssPosition:a(e,"position"),borders:_(e),clip:n&&n.clip?_html2canvas.Util.Extend({},n.clip):null};if(t.useOverflow===true&&/(hidden|scroll|auto)/.test(a(e,"overflow"))===true&&/(BODY)/i.test(e.nodeName)===false){s.clip=s.clip?A(s.clip,r):r}s.zIndex.children.push(s);return s}function nt(e,t,n){var r={left:t.left+e[3].width,top:t.top+e[0].width,width:t.width-(e[1].width+e[3].width),height:t.height-(e[0].width+e[2].width)};if(n){r=A(r,n)}return r}function rt(e,t,n){var r=_html2canvas.Util.Bounds(e),i,s=o.test(e.nodeName)?"#efefef":a(e,"backgroundColor"),u=tt(e,t,r),f=u.borders,l=u.ctx,c=nt(f,r,u.clip),h=q(e,r,f);R(l,h.clip);l.save();l.clip();if(c.height>0&&c.width>0){Q(l,r,s);Y(e,c,l)}l.restore();h.borders.forEach(function(e){U(l,e.args,e.color)});if(!n){$(e,u)}switch(e.nodeName){case"IMG":if(i=L(e.getAttribute("src"))){M(l,e,i,r,f)}else{h2clog("html2canvas: Error loading <img>:"+e.getAttribute("src"))}break;case"INPUT":if(/^(text|url|email|submit|button|reset)$/.test(e.type)&&(e.value||e.placeholder).length>0){z(e,r,u)}break;case"TEXTAREA":if((e.value||e.placeholder||"").length>0){z(e,r,u)}break;case"SELECT":if((e.options||e.placeholder||"").length>0){z(e,r,u)}break;case"LI":k(e,u,c);break;case"VIDEO":var p=document.createElement("canvas");p.width=e.videoWidth||e.clientWidth||320;p.height=e.videoHeight||e.clientHeight||240;var d=p.getContext("2d");d.drawImage(e,0,0,p.width,p.height);M(l,p,p,r,f);break;case"CANVAS":M(l,e,e,r,f);break}return u}function it(e){return a(e,"display")!=="none"&&a(e,"visibility")!=="hidden"&&!e.hasAttribute("data-html2canvas-ignore")}function st(e,t,n){if(it(e)){t=rt(e,t,n)||t;if(!o.test(e.nodeName)){if(e.tagName=="IFRAME")e=e.contentDocument;_html2canvas.Util.Children(e).forEach(function(r){if(r.nodeType===1){st(r,t,n)}else if(r.nodeType===3){x(e,r,t)}})}}}function ot(e,t){function o(e){var t=_html2canvas.Util.Children(e),n=t.length,r,i,u,a,f;for(f=0;f<n;f+=1){a=t[f];if(a.nodeType===3){s+=a.nodeValue.replace(/</g,"&lt;").replace(/>/g,"&gt;")}else if(a.nodeType===1){if(!/^(script|meta|title)$/.test(a.nodeName.toLowerCase())){s+="<"+a.nodeName.toLowerCase();if(a.hasAttributes()){r=a.attributes;u=r.length;for(i=0;i<u;i+=1){s+=" "+r[i].name+'="'+r[i].value+'"'}}s+=">";o(a);s+="</"+a.nodeName.toLowerCase()+">"}}}}var n=new Image,r=c(),i=h(),s="";o(e);n.src=["data:image/svg+xml,","<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='"+r+"' height='"+i+"'>","<foreignObject width='"+r+"' height='"+i+"'>","<html xmlns='http://www.w3.org/1999/xhtml' style='margin:0;'>",s.replace(/\#/g,"%23"),"</html>","</foreignObject>","</svg>"].join("");n.onload=function(){t.svgRender=n}}function ut(){var e=rt(n,null);if(s.svgRendering){ot(document.documentElement,e)}Array.prototype.slice.call(n.children,0).forEach(function(t){st(t,e)});e.backgroundColor=a(document.documentElement,"backgroundColor");u.removeChild(l);return e}var n=t.elements===undefined?document.body:t.elements[0],r=0,i=n.ownerDocument,s=_html2canvas.Util.Support(t,i),o=new RegExp("("+t.ignoreElements+")"),u=i.body,a=_html2canvas.Util.getCSS,f="___html2canvas___pseudoelement",l=i.createElement("style");l.innerHTML="."+f+'-before:before { content: "" !important; display: none !important; }'+"."+f+'-after:after { content: "" !important; display: none !important; }';u.appendChild(l);e=e||{};var P=function(e){return function(t,n,r,i){var s=r*e,o=i*e,u=t+r,a=n+i;return{topLeft:H({x:t,y:a},{x:t,y:a-o},{x:u-s,y:n},{x:u,y:n}),topRight:H({x:t,y:n},{x:t+s,y:n},{x:u,y:a-o},{x:u,y:a}),bottomRight:H({x:u,y:n},{x:u,y:n+o},{x:t+s,y:a},{x:t,y:a}),bottomLeft:H({x:u,y:a},{x:u-s,y:a},{x:t,y:n+o},{x:t,y:n})}}}(4*((Math.sqrt(2)-1)/3));return ut()};_html2canvas.Preload=function(e){function p(e){l.href=e;l.href=l.href;var t=l.protocol+l.host;return t===n}function d(){h2clog("html2canvas: start: images: "+t.numLoaded+" / "+t.numTotal+" (failed: "+t.numFailed+")");if(!t.firstRun&&t.numLoaded>=t.numTotal){h2clog("Finished loading images: # "+t.numTotal+" (failed: "+t.numFailed+")");if(typeof e.complete==="function"){e.complete(t)}}}function v(n,r,i){var o,a=e.proxy,f;l.href=n;n=l.href;o="html2canvas_"+s++;i.callbackname=o;if(a.indexOf("?")>-1){a+="&"}else{a+="?"}a+="url="+encodeURIComponent(n)+"&callback="+o;f=u.createElement("script");window[o]=function(e){if(e.substring(0,6)==="error:"){i.succeeded=false;t.numLoaded++;t.numFailed++;d()}else{S(r,i);r.src=e}window[o]=undefined;try{delete window[o]}catch(n){}f.parentNode.removeChild(f);f=null;delete i.script;delete i.callbackname};f.setAttribute("type","text/javascript");f.setAttribute("src",a);i.script=f;window.document.body.appendChild(f)}function m(e,t){var n=window.getComputedStyle(e,t),i=n.content;if(i.substr(0,3)==="url"){r.loadImage(_html2canvas.Util.parseBackgroundImage(i)[0].args[0])}w(n.backgroundImage,e)}function g(e){m(e,":before");m(e,":after")}function y(e,n){var r=_html2canvas.Generate.Gradient(e,n);if(r!==undefined){t[e]={img:r,succeeded:true};t.numTotal++;t.numLoaded++;d()}}function b(e){return e&&e.method&&e.args&&e.args.length>0}function w(e,t){var n;_html2canvas.Util.parseBackgroundImage(e).filter(b).forEach(function(e){if(e.method==="url"){r.loadImage(e.args[0])}else if(e.method.match(/\-?gradient$/)){if(n===undefined){n=_html2canvas.Util.Bounds(t)}y(e.value,n)}})}function E(e){var t=false;try{_html2canvas.Util.Children(e).forEach(function(e){E(e)})}catch(n){}try{t=e.nodeType}catch(r){t=false;h2clog("html2canvas: failed to access some element's nodeType - Exception: "+r.message)}if(t===1||t===undefined){g(e);try{w(_html2canvas.Util.getCSS(e,"backgroundImage"),e)}catch(n){h2clog("html2canvas: failed to get background-image - Exception: "+n.message)}w(e)}}function S(n,r){n.onload=function(){if(r.timer!==undefined){window.clearTimeout(r.timer)}t.numLoaded++;r.succeeded=true;n.onerror=n.onload=null;d()};n.onerror=function(){if(n.crossOrigin==="anonymous"){window.clearTimeout(r.timer);if(e.proxy){var i=n.src;n=new Image;r.img=n;n.src=i;v(n.src,n,r);return}}t.numLoaded++;t.numFailed++;r.succeeded=false;n.onerror=n.onload=null;d()}}var t={numLoaded:0,numFailed:0,numTotal:0,cleanupDone:false},n,r,i,s=0,o=e.elements[0]||document.body,u=o.ownerDocument,a=u.images,f=a.length,l=u.createElement("a"),c=function(e){return e.crossOrigin!==undefined}(new Image),h;l.href=window.location.href;n=l.protocol+l.host;r={loadImage:function(n){var r,i;if(n&&t[n]===undefined){r=new Image;if(n.match(/data:image\/.*;base64,/i)){r.src=n.replace(/url\(['"]{0,}|['"]{0,}\)$/ig,"");i=t[n]={img:r};t.numTotal++;S(r,i)}else if(p(n)||e.allowTaint===true){i=t[n]={img:r};t.numTotal++;S(r,i);r.src=n}else if(c&&!e.allowTaint&&e.useCORS){r.crossOrigin="anonymous";i=t[n]={img:r};t.numTotal++;S(r,i);r.src=n;r.customComplete=function(){if(!this.img.complete){this.timer=window.setTimeout(this.img.customComplete,100)}else{this.img.onerror()}}.bind(i);r.customComplete()}else if(e.proxy){i=t[n]={img:r};t.numTotal++;v(n,r,i)}}},cleanupDOM:function(n){var r,i;if(!t.cleanupDone){if(n&&typeof n==="string"){h2clog("html2canvas: Cleanup because: "+n)}else{h2clog("html2canvas: Cleanup after timeout: "+e.timeout+" ms.")}for(i in t){if(t.hasOwnProperty(i)){r=t[i];if(typeof r==="object"&&r.callbackname&&r.succeeded===undefined){window[r.callbackname]=undefined;try{delete window[r.callbackname]}catch(s){}if(r.script&&r.script.parentNode){r.script.setAttribute("src","about:blank");r.script.parentNode.removeChild(r.script)}t.numLoaded++;t.numFailed++;h2clog("html2canvas: Cleaned up failed img: '"+i+"' Steps: "+t.numLoaded+" / "+t.numTotal)}}}if(window.stop!==undefined){window.stop()}else if(document.execCommand!==undefined){document.execCommand("Stop",false)}if(document.close!==undefined){document.close()}t.cleanupDone=true;if(!(n&&typeof n==="string")){d()}}},renderingDone:function(){if(h){window.clearTimeout(h)}}};if(e.timeout>0){h=window.setTimeout(r.cleanupDOM,e.timeout)}h2clog("html2canvas: Preload starts: finding background-images");t.firstRun=true;E(o);h2clog("html2canvas: Preload: Finding images");for(i=0;i<f;i+=1){r.loadImage(a[i].getAttribute("src"))}t.firstRun=false;h2clog("html2canvas: Preload: Done.");if(t.numTotal===t.numLoaded){d()}return r};_html2canvas.Renderer=function(e,t){function n(e){var t=[];var n=function(e){var r=[],i=[];e.children.forEach(function(e){if(e.children&&e.children.length>0){r.push(e);i.push(e.zindex)}else{t.push(e)}});i.sort(function(e,t){return e-t});i.forEach(function(e){var t;r.some(function(n,r){t=r;return n.zindex===e});n(r.splice(t,1)[0])})};n(e.zIndex);return t}function r(e){var n;if(typeof t.renderer==="string"&&_html2canvas.Renderer[e]!==undefined){n=_html2canvas.Renderer[e](t)}else if(typeof e==="function"){n=e(t)}else{throw new Error("Unknown renderer")}if(typeof n!=="function"){throw new Error("Invalid renderer defined")}return n}return r(t.renderer)(e,t,document,n(e),_html2canvas)};_html2canvas.Util.Support=function(e,t){function n(){var e=new Image,n=t.createElement("canvas"),r=n.getContext===undefined?false:n.getContext("2d");if(r===false){return false}n.width=n.height=10;e.src=["data:image/svg+xml,","<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'>","<foreignObject width='10' height='10'>","<div xmlns='http://www.w3.org/1999/xhtml' style='width:10;height:10;'>","sup","</div>","</foreignObject>","</svg>"].join("");try{r.drawImage(e,0,0);n.toDataURL()}catch(i){return false}h2clog("html2canvas: Parse: SVG powered rendering available");return true}function r(){var e,n,r,i,s=false;if(t.createRange){e=t.createRange();if(e.getBoundingClientRect){n=t.createElement("boundtest");n.style.height="123px";n.style.display="block";t.body.appendChild(n);e.selectNode(n);r=e.getBoundingClientRect();i=r.height;if(i===123){s=true}t.body.removeChild(n)}}return s}return{rangeBounds:r(),svgRendering:e.svgRendering&&n()}};window.html2canvas=function(e,t){e=e.length?e:[e];var n,r,i={logging:false,elements:e,background:"#fff",proxy:null,timeout:0,useCORS:false,allowTaint:false,svgRendering:false,ignoreElements:"IFRAME|OBJECT|PARAM",useOverflow:true,letterRendering:false,chinese:false,width:null,height:null,taintTest:true,renderer:"Canvas"};i=_html2canvas.Util.Extend(t,i);_html2canvas.logging=i.logging;i.complete=function(e){if(typeof i.onpreloaded==="function"){if(i.onpreloaded(e)===false){return}}n=_html2canvas.Parse(e,i);if(typeof i.onparsed==="function"){if(i.onparsed(n)===false){return}}r=_html2canvas.Renderer(n,i);if(typeof i.onrendered==="function"){if(typeof i.grabMouse!="undefined"&&!i.grabMouse){i.onrendered(r)}else{var t=new Image(25,25);t.onload=function(){r.getContext("2d").drawImage(t,coordX,coordY,25,25);i.onrendered(r)};t.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAZCAYAAAAxFw7TAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjExR/NCNwAAAzZJREFUSEut1EtME1EUANBiTTFaivRDKbaFFgiILgxx0bQllYItYKFIgEYoC2oEwqeCC4gG1xg2dmEwEQMJujIxwQ24wA2uCFAB3SBBfqWuyqd/CuV634QSPgOFxElu+mZye+a++948BgAw/mccYAwGIyY7O1vR3NzSiuMLX5GiDoO8tLQ0QzAYDLW1tT2/qEgHJslk8rKtLU9odzcMTU3N7RdB6UBhRkZG6fz8QrCuzgJutwfq6xtazovSgunp6SUOhzPI5XJBr9fD9nYojHjDeVA6MJH0EMGARCIBRKC8vJygO2ZzrSUaSgumpqY+cDjWAlJpCgWSMJlMiO6EqqpMtWehtKBUKi1eXV3zI3wAEhQrJJUGseJHp6G0IE61CKfsl8lkR0CCWiyPAXeU32AwVNChdKAAwUIEfXK5/ARI0IaGRkS3vXp9ofE4SguKxWL92tpfH642LUjQ1lYr+P0Bt1abX3wYPQv04n48FSRoe/sz8Pn8G7m5uboISgfyk5OT72OF3szMzBMgk8k88qyjowPW1zddCoVCS1BaUCQSEdCTlZV18GcOh0ONq6trYGbmJ0xMTO3Z7dMwPj4B4XAYXC7XhkqlKqAFBQJBAS6KB08dClEqlTA8/JUak5cEAkHo6nppMxqN7ZWVVZ0GQ0lnRUXlC6VSVXoamI+gm/RQKEyChYU/u5gYUqvVFDo09AVsNttrHMdh3MAQYyRhxNIeX3y+QLu0tLKlVufC5OQU9Pa+/TgwMPCpv7+fAouKigG/pFX81qV4H4PBwrh8Wg95eOUtLi5vLi+v4FSHRzExRafTNZJ7NptNobOzs2C1Wp+eZx/yEhIS8jwer99ut//icOJvk+mwWCzF3NzvebPZTIF4+ILd/mMcx1ei7UOeUCjUjY19n8YvRYPJVzG4GGk9PT3vRkZGKJDH44PT6STTfxgNjGez4+4idg8Tr+8nx+KvNCcnx4y926mpMUNf33vY2wPo7n71JhpImszer4x5KFmE4zujo98m3W6ve3Dww2eNRvMEW3GLrG4kj26Vj/c5ch+Pg5t4ApXhopFWSDASMcjzg+siIKmWVJm839Nr+Hvp+Nsj4D+5Hdf43ZzjNQAAAABJRU5ErkJggg=="}}};window.setTimeout(function(){_html2canvas.Preload(i)},0);return{render:function(e,t){return _html2canvas.Renderer(e,_html2canvas.Util.Extend(t,i))},parse:function(e,t){return _html2canvas.Parse(e,_html2canvas.Util.Extend(t,i))},preload:function(e){return _html2canvas.Preload(_html2canvas.Util.Extend(e,i))},log:h2clog}};window.html2canvas.log=h2clog;window.html2canvas.Renderer={Canvas:undefined};_html2canvas.Renderer.Canvas=function(e){function o(e,t){e.beginPath();t.forEach(function(t){e[t.name].apply(e,t["arguments"])});e.closePath()}function u(e){if(n.indexOf(e["arguments"][0].src)===-1){i.drawImage(e["arguments"][0],0,0);try{i.getImageData(0,0,1,1)}catch(s){r=t.createElement("canvas");i=r.getContext("2d");return false}n.push(e["arguments"][0].src)}return true}function a(e){return e==="transparent"||e==="rgba(0, 0, 0, 0)"}function f(t,n){switch(n.type){case"variable":t[n.name]=n["arguments"];break;case"function":if(n.name==="createPattern"){if(n["arguments"][0].width>0&&n["arguments"][0].height>0){try{t.fillStyle=t.createPattern(n["arguments"][0],"repeat")}catch(r){h2clog("html2canvas: Renderer: Error creating pattern",r.message)}}}else if(n.name==="drawShape"){o(t,n["arguments"])}else if(n.name==="drawImage"){if(n["arguments"][8]>0&&n["arguments"][7]>0){if(!e.taintTest||e.taintTest&&u(n)){t.drawImage.apply(t,n["arguments"])}}}else{t[n.name].apply(t,n["arguments"])}break}}e=e||{};var t=document,n=[],r=document.createElement("canvas"),i=r.getContext("2d"),s=e.canvas||t.createElement("canvas");return function(e,t,n,r,i){var o=s.getContext("2d"),u,l,c,h,p,d;s.width=s.style.width=t.width||e.ctx.width;s.height=s.style.height=t.height||e.ctx.height;d=o.fillStyle;o.fillStyle=a(e.backgroundColor)&&t.background!==undefined?t.background:e.backgroundColor;o.fillRect(0,0,s.width,s.height);o.fillStyle=d;if(t.svgRendering&&e.svgRender!==undefined){o.drawImage(e.svgRender,0,0)}else{for(l=0,c=r.length;l<c;l+=1){u=r.splice(0,1)[0];u.canvasPosition=u.canvasPosition||{};o.textBaseline="bottom";if(u.clip){o.save();o.beginPath();o.rect(u.clip.left,u.clip.top,u.clip.width,u.clip.height);o.clip()}if(u.ctx.storage){u.ctx.storage.forEach(f.bind(null,o))}if(u.clip){o.restore()}}}h2clog("html2canvas: Renderer: Canvas renderer done - returning canvas obj");c=t.elements.length;if(c===1){if(typeof t.elements[0]==="object"&&t.elements[0].nodeName!=="BODY"){p=i.Util.Bounds(t.elements[0]);h=n.createElement("canvas");h.width=p.width;h.height=p.height;o=h.getContext("2d");o.drawImage(s,p.left,p.top,p.width,p.height,0,0,p.width,p.height);s=null;return h}}return s}};(function(){var e=0,t=["ms","moz","webkit","o"];for(var n=0;n<t.length&&!window.requestAnimationFrame;++n){window.requestAnimationFrame=window[t[n]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[t[n]+"CancelAnimationFrame"]||window[t[n]+"RequestCancelAnimationFrame"]}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(t,n){var r=(new Date).getTime();var i=Math.max(0,16-(r-e));var s=window.setTimeout(function(){t(r+i)},i);e=r+i;return s};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(e){clearTimeout(e)}})();var IE=document.all?true:false;if(!IE)document.captureEvents(Event.MOUSEMOVE);document.addEventListener("mousemove",getMouseXY,false);var coordX=0;var coordY=0
    }

    // GLFX
      var fx=function(){function e(e,t,r){return Math.max(e,Math.min(t,r))}function t(e){return{_:e,loadContentsOf:function(e){oe=this._.gl,this._.loadContentsOf(e)},destroy:function(){oe=this._.gl,this._.destroy()}}}function r(e){return t(ae.fromElement(e))}function o(e,t){var r=oe.UNSIGNED_BYTE;if(oe.getExtension("OES_texture_float")&&oe.getExtension("OES_texture_float_linear")){var o=new ae(100,100,oe.RGBA,oe.FLOAT);try{o.drawTo(function(){r=oe.FLOAT})}catch(i){}o.destroy()}this._.texture&&this._.texture.destroy(),this._.spareTexture&&this._.spareTexture.destroy(),this.width=e,this.height=t,this._.texture=new ae(e,t,oe.RGBA,r),this._.spareTexture=new ae(e,t,oe.RGBA,r),this._.extraTexture=this._.extraTexture||new ae(0,0,oe.RGBA,r),this._.flippedShader=this._.flippedShader||new ie(null,"        uniform sampler2D texture;        varying vec2 texCoord;        void main() {            gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y));        }    "),this._.isInitialized=!0}function i(e,t,r){return this._.isInitialized&&e._.width==this.width&&e._.height==this.height||o.call(this,t?t:e._.width,r?r:e._.height),e._.use(),this._.texture.drawTo(function(){ie.getDefaultShader().drawRect()}),this}function a(){return this._.texture.use(),this._.flippedShader.drawRect(),this}function n(e,t,r,o){(r||this._.texture).use(),this._.spareTexture.drawTo(function(){e.uniforms(t).drawRect()}),this._.spareTexture.swapWith(o||this._.texture)}function c(e){return e.parentNode.insertBefore(this,e),e.parentNode.removeChild(e),this}function l(){var e=new ae(this._.texture.width,this._.texture.height,oe.RGBA,oe.UNSIGNED_BYTE);return this._.texture.use(),e.drawTo(function(){ie.getDefaultShader().drawRect()}),t(e)}function u(){var e=this._.texture.width,t=this._.texture.height,r=new Uint8Array(e*t*4);return this._.texture.drawTo(function(){oe.readPixels(0,0,e,t,oe.RGBA,oe.UNSIGNED_BYTE,r)}),r}function s(e){return function(){return oe=this._.gl,e.apply(this,arguments)}}function x(e,t,r,o,i,a,n,c){var l=r-i,u=o-a,s=n-i,x=c-a,f=e-r+i-n,h=t-o+a-c,m=l*x-s*u,d=(f*x-s*h)/m,g=(l*h-f*u)/m;return[r-e+d*r,o-t+d*o,d,n-e+g*n,c-t+g*c,g,e,t,1]}function f(e){var t=e[0],r=e[1],o=e[2],i=e[3],a=e[4],n=e[5],c=e[6],l=e[7],u=e[8],s=t*a*u-t*n*l-r*i*u+r*n*c+o*i*l-o*a*c;return[(a*u-n*l)/s,(o*l-r*u)/s,(r*n-o*a)/s,(n*c-i*u)/s,(t*u-o*c)/s,(o*i-t*n)/s,(i*l-a*c)/s,(r*c-t*l)/s,(t*a-r*i)/s]}function h(e,t){return[e[0]*t[0]+e[1]*t[3]+e[2]*t[6],e[0]*t[1]+e[1]*t[4]+e[2]*t[7],e[0]*t[2]+e[1]*t[5]+e[2]*t[8],e[3]*t[0]+e[4]*t[3]+e[5]*t[6],e[3]*t[1]+e[4]*t[4]+e[5]*t[7],e[3]*t[2]+e[4]*t[5]+e[5]*t[8],e[6]*t[0]+e[7]*t[3]+e[8]*t[6],e[6]*t[1]+e[7]*t[4]+e[8]*t[7],e[6]*t[2]+e[7]*t[5]+e[8]*t[8]]}function m(e){var t=e.length;this.xa=[],this.ya=[],this.u=[],this.y2=[],e.sort(function(e,t){return e[0]-t[0]});for(var r=0;t>r;r++)this.xa.push(e[r][0]),this.ya.push(e[r][1]);this.u[0]=0,this.y2[0]=0;for(var r=1;t-1>r;++r){var o=this.xa[r+1]-this.xa[r-1],i=(this.xa[r]-this.xa[r-1])/o,a=i*this.y2[r-1]+2;this.y2[r]=(i-1)/a;var n=(this.ya[r+1]-this.ya[r])/(this.xa[r+1]-this.xa[r])-(this.ya[r]-this.ya[r-1])/(this.xa[r]-this.xa[r-1]);this.u[r]=(6*n/o-i*this.u[r-1])/a}this.y2[t-1]=0;for(var r=t-2;r>=0;--r)this.y2[r]=this.y2[r]*this.y2[r+1]+this.u[r]}function d(e,t){return new ie(null,e+"    uniform sampler2D texture;    uniform vec2 texSize;    varying vec2 texCoord;    void main() {        vec2 coord = texCoord * texSize;        "+t+"        gl_FragColor = texture2D(texture, coord / texSize);        vec2 clampedCoord = clamp(coord, vec2(0.0), texSize);        if (coord != clampedCoord) {            /* fade to transparent if we are outside the image */            gl_FragColor.a *= max(0.0, 1.0 - length(coord - clampedCoord));        }    }")}function g(t,r){return oe.brightnessContrast=oe.brightnessContrast||new ie(null,"        uniform sampler2D texture;        uniform float brightness;        uniform float contrast;        varying vec2 texCoord;        void main() {            vec4 color = texture2D(texture, texCoord);            color.rgb += brightness;            if (contrast > 0.0) {                color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;            } else {                color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;            }            gl_FragColor = color;        }    "),n.call(this,oe.brightnessContrast,{brightness:e(-1,t,1),contrast:e(-1,r,1)}),this}function v(t){for(var r=new m(t),o=[],i=0;256>i;i++)o.push(e(0,Math.floor(256*r.interpolate(i/255)),255));return o}function p(e,t,r){e=v(e),1==arguments.length?t=r=e:(t=v(t),r=v(r));for(var o=[],i=0;256>i;i++)o.splice(o.length,0,e[i],t[i],r[i],255);return this._.extraTexture.initFromBytes(256,1,o),this._.extraTexture.use(1),oe.curves=oe.curves||new ie(null,"        uniform sampler2D texture;        uniform sampler2D map;        varying vec2 texCoord;        void main() {            vec4 color = texture2D(texture, texCoord);            color.r = texture2D(map, vec2(color.r)).r;            color.g = texture2D(map, vec2(color.g)).g;            color.b = texture2D(map, vec2(color.b)).b;            gl_FragColor = color;        }    "),oe.curves.textures({map:1}),n.call(this,oe.curves,{}),this}function y(e){oe.denoise=oe.denoise||new ie(null,"        uniform sampler2D texture;        uniform float exponent;        uniform float strength;        uniform vec2 texSize;        varying vec2 texCoord;        void main() {            vec4 center = texture2D(texture, texCoord);            vec4 color = vec4(0.0);            float total = 0.0;            for (float x = -4.0; x <= 4.0; x += 1.0) {                for (float y = -4.0; y <= 4.0; y += 1.0) {                    vec4 sample = texture2D(texture, texCoord + vec2(x, y) / texSize);                    float weight = 1.0 - abs(dot(sample.rgb - center.rgb, vec3(0.25)));                    weight = pow(weight, exponent);                    color += sample * weight;                    total += weight;                }            }            gl_FragColor = color / total;        }    ");for(var t=0;2>t;t++)n.call(this,oe.denoise,{exponent:Math.max(0,e),texSize:[this.width,this.height]});return this}function b(e){return oe.bokeh=oe.bokeh||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        float PI = 3.14159265;        uniform sampler2D texture2;        float init = 1.0;        uniform float time;        uniform vec3 p0;        uniform vec3 p1;        uniform vec3 p2;        uniform vec3 p3;        uniform vec3 p4;        uniform vec3 p5;        uniform vec3 p6;        uniform vec3 p7;        vec2 center = vec2(400,300);        float radius = 720.0;        vec3 hue(vec3 c,float a){          float sa=sin(a*PI),ca=cos(a*PI);          vec3 w=(vec3(2.0*ca,-sqrt(3.0)*sa-ca,sqrt(3.0)*sa-ca)+1.0)/3.0;          return vec3(dot(c,w.xyz),dot(c,w.zxy),dot(c,w.yzx));        }        void main(){          vec3 c=texture2D(texture,texCoord*0.994+0.003).rgb;          if(init==1.0) c=(c+0.5)*c-0.1;          vec2 p=texCoord*vec2(800.0,800.0*texSize.y/texSize.x);          vec3 b0=texture2D(texture2,(p-p0.xy)/p0.z).rgb;          vec3 b1=vec3(texture2D(texture2,(p-p1.xy)/p1.z).r*1.3);          b1.g=b1.b-=0.05;          vec3 b2=texture2D(texture2,(p-p2.xy)/p2.z).rgb;          vec3 b3=texture2D(texture2,(p-p3.xy)/p3.z).rgb;          vec3 b4=texture2D(texture2,(p-p4.xy)/p4.z).rgb;          vec3 b5=texture2D(texture2,(p-p5.xy)/p5.z).rgb;          vec3 b6=texture2D(texture2,(p-p6.xy)/p6.z).rgb;          vec3 b7=texture2D(texture2,(p-p7.xy)/p7.z).rgb;          vec3 c1=hue(b0,0.1) +\nb1 +\nhue(b2,-0.1) +\nhue(b3,-0.2) +\nb4*0.3 +\nb5*0.5 +\nb6*1.5 +\nb7;gl_FragColor=vec4(clamp(c+hue(c1,time*0.2)*length(texCoord*texSize-center)/radius*0.8,0.0,1.0),1.0);        }    "),n.call(this,oe.bokeh,{time:e}),this}function _(e){return oe.flare=oe.flare||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        uniform float time;        float hl(float c1,float c0){          return(c0<0.5?(2.0*c0*c1):(1.0-2.0*(1.0-c0)*(1.0-c1)));        }        void main(){          vec2 p=texCoord-0.2;          vec3 c=vec3(0.0);          for(float i=0.0;i<4.0;i++){            float t=time/4.0+i*3.0;            p.y+=sin(p.x*2.0-t)-sin(t)*0.1;            p.x+=cos(p.y*3.0-t+cos(t))*0.15;            float w=(sin(p.x*10.0)+sin(i*0.1)+p.y*8.0);            float z=1.0/sqrt(abs(w))*(abs(sin(time*0.1+2.0))*0.5+2.0);            c+=vec3(z*0.2,z*0.1,z*0.025);          }          vec3 c0=texture2D(texture,texCoord).rgb;          c=vec3(hl(c0.r,c.r),hl(c0.g,c.g),hl(c0.b,c.b));          gl_FragColor=vec4(clamp(c0*c0+c*0.5,0.0,1.0),1.0);        }    "),n.call(this,oe.flare,{time:e}),this}function C(e){return oe.halo=oe.halo||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        float RADIUS = 0.4;        float TWO_PI = 6.28318531;        float X_PRO = 0.5;        uniform float time;        void main(){          vec2 p=(texCoord-vec2(0.5))*texSize/texSize.y;          float r=length(p*8.0),a=atan(p.y+1.5,p.x),t=time+50.0/(r+1.0),d=abs(0.05/(sin(t)+sin(time+a*8.0)))*28.0;          vec3 c=vec3(-sin(r*5.0-a-time+sin(r+t)),sin(r*3.0+a-cos(time)+sin(r+t)),cos(r+a*2.0+log(5.001-(a/4.0))-time)+sin(r+t));          float dist=length(p);          if(dist<RADIUS) c+=(dist-RADIUS)*11.0;          vec3 c0=texture2D(texture,texCoord).rgb;          c0.r-=sin(c0.r*TWO_PI)*X_PRO;          c0.g-=sin(c0.g*TWO_PI)*X_PRO;          c0.b+=sin(c0.b*TWO_PI)*X_PRO;          gl_FragColor=vec4(c0+clamp(c*d*0.2,0.0,1.0),1.0);        }    "),n.call(this,oe.halo,{time:e}),this}function w(e){return oe.smoke=oe.smoke||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        uniform float time;        float r(float d,float w,float o){          return(cos(d*0.0174533)+1.0)*w+o;        }        void main(){          vec2 p=texCoord;          float t=time*0.25+1024.0,w=r(t*10.0,2.0,0.5),cw=cos(w)*0.0075,xo=r(t*0.12,2.5,5.0),yo=r(t*0.1,4.0,5.0);          for(float i=1.0;i<31.0;i++){            p.x+=sin(p.y*i+t*cw+i*0.03)*0.375/i+xo;            p.y+=sin(p.x*i+t*w*0.00375+(i+15.0)*0.03)*0.6/i+yo;          }          vec3 c0=(texture2D(texture,texCoord).rgb-0.5)*1.5+0.6;          c0=mix(c0,vec3(c0.r*0.3+c0.g*0.59+c0.b*0.11),0.5);          vec3 c1=clamp(vec3(sin(p.x*3.0)*0.5+0.5,sin(p.y*3.0)*0.5+0.5,sin(p.x+p.y)),0.0,1.0)*0.7+0.3;          gl_FragColor=vec4(1.0-(1.0-c0)*(1.0-c1),1.0);        }    "),n.call(this,oe.smoke,{time:e}),this}function T(){return oe.berry=oe.berry||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        const vec3 g1=vec3(1.0,0.6,0.8);        const vec3 g2=vec3(0.6,0.8,1.0);        void main(){          vec3 c=(texture2D(texture,texCoord).rgb-0.5)*1.8+0.5;          c=vec3(c.r*0.3+c.g*0.59+c.b*0.11);          vec3 g=mix(g1,g2,texCoord.x*(texSize.y/texSize.x)+(texSize.x-texSize.y)/texSize.x/2.0);          gl_FragColor=vec4(1.0-(1.0-c)*(1.0-g),1.0);        }    "),n.call(this,oe.berry,{}),this}function E(){return oe.spycam=oe.spycam||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        float PI = 3.14159265;        const vec3 tint=vec3(0.85,1.1,1.35);        float rand(vec2 r){          return fract(sin(dot(r,vec2(12.9898,78.233)))*43758.5453);        }        void main(){          vec2 p=texCoord;          float b=mix(sin(p.x*PI),sin(p.y*PI),0.5);          vec3 c=texture2D(texture,p).rgb;          float noise=rand(vec2(c.g,atan(p.x,p.y)));          float tv=mix(b,mix(b/2.0,abs(sin(gl_FragCoord.y/2.0))/1.5,0.5),0.5)+noise/16.0;          c=vec3(c.r*0.3+c.g*0.59+c.b*0.11)*tint;          gl_FragColor=vec4(((c-0.5)*4.0+1.0)*vec3(tv),1.0);        }    "),n.call(this,oe.spycam,{}),this}function E(){return oe.spycam=oe.spycam||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        float PI = 3.14159265;        const vec3 tint=vec3(0.85,1.1,1.35);        float rand(vec2 r){          return fract(sin(dot(r,vec2(12.9898,78.233)))*43758.5453);        }        void main(){          vec2 p=texCoord;          float b=mix(sin(p.x*PI),sin(p.y*PI),0.5);          vec3 c=texture2D(texture,p).rgb;          float noise=rand(vec2(c.g,atan(p.x,p.y)));          float tv=mix(b,mix(b/2.0,abs(sin(gl_FragCoord.y/2.0))/1.5,0.5),0.5)+noise/16.0;          c=vec3(c.r*0.3+c.g*0.59+c.b*0.11)*tint;          gl_FragColor=vec4(((c-0.5)*4.0+1.0)*vec3(tv),1.0);        }    "),n.call(this,oe.spycam,{}),this}function D(){return oe.murica=oe.murica||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        void main(){            float x = texCoord.x;            vec3 tc=vec3(texture2D(texture,texCoord).rgb);            if(x>0.0 && x<0.33) tc.rgb*=vec3(0.0,0.0,1.0);            if(x>0.33 && x<0.66) tc.rgb*=vec3(1.0,1.0,1.0);            if(x>0.66) tc.rgb*=vec3(1.0,0.0,0.0);            gl_FragColor=vec4(tc,1.0);        }    "),n.call(this,oe.murica,{texSize:[this.width,this.height]}),this}function S(e,t,r){return oe.nightvision=oe.nightvision||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        uniform float time;        uniform float luminanceThreshold;        uniform float colorAmplification;        void main (){          vec4 finalColor;          vec2 uv;          uv.x = 0.4*sin(time*50.0);          uv.y = 0.4*cos(time*50.0);          vec3 c = texture2D(texture, texCoord).rgb;          float lum = dot(vec3(0.30, 0.59, 0.11), c);          if (lum < luminanceThreshold) c *= colorAmplification;           vec3 visionColor = vec3(0.1, 0.95, 0.2);          finalColor.rgb = (c * visionColor);          gl_FragColor.rgb = finalColor.rgb;          gl_FragColor.a = 1.0;        }    "),n.call(this,oe.nightvision,{time:e,luminanceThreshold:t,colorAmplification:r,texSize:[this.width,this.height]}),this}function z(e,t){return oe.posterize=oe.posterize||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        uniform float gamma;        uniform float numColors;        void main(){          vec3 c = texture2D(texture, texCoord).rgb;          c = pow(c, vec3(gamma, gamma, gamma));          c = c * numColors;          c = floor(c);          c = c / numColors;          c = pow(c, vec3(1.0/gamma));          gl_FragColor = vec4(c, 1.0);        }    "),n.call(this,oe.posterize,{gamma:e,numColors:t,texSize:[this.width,this.height]}),this}function R(e,t,r,o,i){return oe.badtv=oe.badtv||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        float time;        float distortion;        float distortion2;        float speed;        float rollSpeed;        vec3 mod289(vec3 x) {          return x - floor(x * (1.0 / 289.0)) * 289.0;        }        vec2 mod289(vec2 x) {          return x - floor(x * (1.0 / 289.0)) * 289.0;        }        vec3 permute(vec3 x) {          return mod289(((x*34.0)+1.0)*x);        }        float snoise(vec2 v) {          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);          vec2 i  = floor(v + dot(v, C.yy) );          vec2 x0 = v - i + dot(i, C.xx);          vec2 i1;          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);          vec4 x12 = x0.xyxy + C.xxzz;          x12.xy -= i1;          i = mod289(i);          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);          m = m*m ;          m = m*m ;          vec3 x = 2.0 * fract(p * C.www) - 1.0;          vec3 h = abs(x) - 0.5;          vec3 ox = floor(x + 0.5);          vec3 a0 = x - ox;          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );          vec3 g;          g.x  = a0.x  * x0.x  + h.x  * x0.y;          g.yz = a0.yz * x12.xz + h.yz * x12.yw;          return 130.0 * dot(m, g);        }        void main() {          vec2 p = texCoord;          float ty = time*speed;          float yt = p.y - time;          float offset = snoise(vec2(yt*3.0,0.0))*0.2;          offset = offset*distortion * offset*distortion * offset;          offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;          float v_offset = time / texSize[1];          gl_FragColor = texture2D(texture, vec2(fract(p.x),(p.y - v_offset) ));        }    "),n.call(this,oe.badtv,{time:e,distortion:t,distortion2:r,speed:o,rollSpeed:i,texSize:[this.width,this.height]}),this}function A(e){return oe.magazine=oe.magazine||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        float K = 1.0471975511965976;        uniform float size;        float cosa = 0.5000000000000001;        float sina = 0.8660254037844386;        float fade = 1152.0;        vec2 center = vec2(400.0, 300.0);        vec4 rect = vec4(0.028, 0.021, 0.972, 0.979);        void main(){          vec2 p=texCoord*1.04-0.02;          vec3 c=(texture2D(texture,p).rgb-0.5)*1.3+0.6;          float lu=(c.r*0.3+c.g*0.59+c.b*0.11)*16.0-8.0;          if(texCoord.x<rect.t) lu+=(rect.t-texCoord.x)*fade;          else if(texCoord.x>rect.q) lu+=(texCoord.x-rect.q)*fade;          if(texCoord.y<rect.s) lu+=(rect.s-texCoord.y)*fade;          else if(texCoord.y>rect.p) lu+=(texCoord.y-rect.p)*fade;          p=gl_FragCoord.xy-center;          p=vec2(p.x*cosa-p.y*sina,p.x*sina+p.y*cosa)*size;          gl_FragColor=vec4(clamp(vec3(lu+sin(p.x)*sin(p.y)*4.0),0.0,1.0),1.0);        }    "),n.call(this,oe.magazine,{size:e}),this}function P(e,t,r){return oe.rainbow=oe.rainbow||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        uniform float radius;        uniform float border;        uniform float ratio;        void main(){          vec2 p=texCoord-0.5;          float r=radius/texSize.y,b=length(max(abs(vec2(p.x*texSize.x/texSize.y,p.y)/r)-vec2(0.5*ratio,0.5)/r+border,0.0));          gl_FragColor=vec4(1.0-(1.0-texture2D(texture,texCoord).rgb)*clamp(smoothstep(1.02,0.98,b),0.0,1.0),1.0);        }    "),n.call(this,oe.rainbow,{border:e,radius:t,ratio:r}),this}function U(e,t,r){return oe.snow=oe.snow||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        uniform vec2 center;        uniform float radius;        uniform float width;        const vec3 frost=vec3(0.9,1.1,1.5);        void main(){          vec3 c=texture2D(texture,texCoord).rgb;          float attn,outerRadius=radius+width,dist=distance(texCoord*texSize,center);          if(dist<radius) attn=0.0;          else if(dist>outerRadius) attn=1.0;          else attn=(dist-radius)/width;attn=max(0.1,attn);          gl_FragColor=vec4((1.0-(1.0-c)*(1.0-attn))*frost,1.0);        }    "),n.call(this,oe.snow,{center:e,radius:t,width:r}),this}function F(e,t,r){return oe.fire=oe.fire||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        float PI = 3.14159265;        float WAVELENGTH = 26.0;        float AMPLITUDE = 0.0125;        float SPEED = 3.0;        uniform sampler2D frame1;        uniform sampler2D frame2;        uniform sampler2D frame3;        uniform sampler2D frame4;        uniform sampler2D frame5;        uniform sampler2D frame6;        uniform float time;        uniform float left;        uniform float right;        const vec3 fire=vec3(0.9,0.3,0.0);        const vec3 fire2=vec3(1.2,1.0,0.8);        vec3 mod289(vec3 x){          return x-floor(x*(1.0/289.0))*289.0;        }        vec4 mod289(vec4 x){          return x-floor(x*(1.0/289.0))*289.0;        }        vec4 permute(vec4 x){          return mod289(((x*34.0)+1.0)*x);        }        vec4 taylorInvSqrt(vec4 r){          return 1.79284291400159-0.85373472095314*r;        }        vec3 fade(vec3 t){          return t*t*t*(t*(t*6.0-15.0)+10.0);        }        float noise(vec3 P){          vec3 Pi0=floor(P),Pi1=Pi0+vec3(1.0);          Pi0=mod289(Pi0);          Pi1=mod289(Pi1);          vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.0);          vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x),iy=vec4(Pi0.yy,Pi1.yy),iz0=Pi0.zzzz,iz1=Pi1.zzzz,ixy=permute(permute(ix)+iy),ixy0=permute(ixy+iz0),ixy1=permute(ixy+iz1),gx0=ixy0*(1.0/7.0),gy0=fract(floor(gx0)*(1.0/7.0))-0.5;          gx0=fract(gx0);          vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0),sz0=step(gz0,vec4(0.0));          gx0-=sz0*(step(0.0,gx0)-0.5);          gy0-=sz0*(step(0.0,gy0)-0.5);          vec4 gx1=ixy1*(1.0/7.0),gy1=fract(floor(gx1)*(1.0/7.0))-0.5;          gx1=fract(gx1);vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1),sz1=step(gz1,vec4(0.0));          gx1-=sz1*(step(0.0,gx1)-0.5);          gy1-=sz1*(step(0.0,gy1)-0.5);          vec3 g000=vec3(gx0.x,gy0.x,gz0.x),g100=vec3(gx0.y,gy0.y,gz0.y),g010=vec3(gx0.z,gy0.z,gz0.z),g110=vec3(gx0.w,gy0.w,gz0.w),g001=vec3(gx1.x,gy1.x,gz1.x),g101=vec3(gx1.y,gy1.y,gz1.y),g011=vec3(gx1.z,gy1.z,gz1.z),g111=vec3(gx1.w,gy1.w,gz1.w);          vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));          g000*=norm0.x;g010*=norm0.y;g100*=norm0.z;          g110*=norm0.w;          vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));          g001*=norm1.x;g011*=norm1.y;          g101*=norm1.z;g111*=norm1.w;          float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.x,Pf0.yz)),n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)),n110=dot(g110,vec3(Pf1.xy,Pf0.z)),n001=dot(g001,vec3(Pf0.xy,Pf1.z)),n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z)),n011=dot(g011,vec3(Pf0.x,Pf1.yz)),n111=dot(g111,Pf1);          vec3 fade_xyz=fade(Pf0);          vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);          vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);          return mix(n_yz.x,n_yz.y,fade_xyz.x);        }        float diff(vec3 c1,vec3 c2){c1=(c1-c2)*5.0;          return clamp(c1.r+c1.g+c1.b,0.2,1.2)-0.2;        }        void main(){          if(texCoord.x<left||texCoord.x>right) gl_FragColor=vec4(0.0);          else{vec2 p=texCoord+sin(vec2(noise(vec3(texCoord,time*SPEED)*WAVELENGTH)*PI*AMPLITUDE,noise(vec3(texCoord,(time+1.0)*SPEED)*WAVELENGTH)*PI*AMPLITUDE));            vec3 c0=texture2D(texture,p).rgb,c1=texture2D(frame6,p).rgb,c2=texture2D(frame5,p).rgb,c3=texture2D(frame4,p).rgb,c4=texture2D(frame3,p).rgb,c5=texture2D(frame2,p).rgb,c6=texture2D(frame1,p).rgb;            float c=diff(c0,c1)*2.0;            c+=diff(c1,c2);            c+=diff(c2,c3);            c+=diff(c3,c4);            c+=diff(c4,c5)*0.5;            c+=diff(c5,c6)*0.125;gl_FragColor=vec4(texture2D(texture,texCoord).rgb*fire2+c*fire,1.0);          }        }    "),n.call(this,oe.fire,{time:e,left:t,right:r}),this}function B(){return oe.crosshatch=oe.crosshatch||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        void main(){          vec3 c=(texture2D(texture,texCoord).rgb-0.5)*1.5+0.7;          float lu=c.r*0.3+c.g*0.59+c.b*0.11,p0=gl_FragCoord.x+gl_FragCoord.y,p1=gl_FragCoord.x-gl_FragCoord.y,h=1.0;          if(lu<0.75&&mod(p0,8.0)==0.0 ||            lu<0.5&&mod(p1,8.0)==0.0 ||            lu<0.4&&mod(p0-4.0,8.0)==0.0 ||            lu<0.3&&mod(p1-4.0,8.0)==0.0 ||            lu<0.2&&mod(p0-2.0,4.0)==0.0 ||            lu<0.1&&mod(p1-2.0,4.0)==0.0) h=0.0;gl_FragColor=vec4(h,h,h,1.0);        }    "),n.call(this,oe.crosshatch,{}),this}function L(e,t,r,o){return oe.cocoa=oe.cocoa||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        uniform float R_LU;        uniform float G_LU;        uniform float B_LU;        uniform float SAT;        uniform sampler2D texture2;        float fade = 60.0;        vec4 rect = vec4(0.022, 0.0165, 0.978, 0.9835);        vec2 center = vec2(400, 300);        float radius = 133.33333333333334;        float width = 348.0;        const vec3 tint=vec3(0.0,-0.18,-0.28);        void main(){          vec2 p=texCoord*1.025-0.0125;          vec3 c0=1.0-(1.0-texture2D(texture,p).rgb)*(1.0-texture2D(texture2,p).rgb);          vec3 c;          c.r=((R_LU+(1.0-R_LU)*SAT)*c0.r)+((G_LU-G_LU*SAT)*c0.g)+((B_LU-B_LU*SAT)*c0.b);          c.g=((R_LU-R_LU*SAT)*c0.r)+((G_LU+(1.0-G_LU)*SAT)*c0.g)+((B_LU-B_LU*SAT)*c0.b);          c.b=((R_LU-R_LU*SAT)*c0.r)+((G_LU-G_LU*SAT)*c0.g)+((B_LU+(1.0-B_LU)*SAT)*c0.b);          c+=tint*(1.0-c);          float attn,outerRadius=radius+width,dist=distance(p*texSize,center),bc=0.0;          if(texCoord.x<rect.t) bc=(rect.t-texCoord.x)*fade;          else if(texCoord.x>rect.q) bc=(texCoord.x-rect.q)*fade;          if(texCoord.y<rect.s) bc+=(rect.s-texCoord.y)*fade;          else if(texCoord.y>rect.p) bc+=(texCoord.y-rect.p)*fade;          if(dist<radius) attn=1.0;          else if(dist>outerRadius) attn=0.0;          else attn=1.0-pow((dist-radius)/width,1.4);          gl_FragColor=vec4(clamp((c*vec3(attn,attn-0.09,attn-0.14)-bc),0.0,1.0),1.0);        }    "),n.call(this,oe.cocoa,{R_LU:e,G_LU:t,B_LU:r,SAT:o}),this}function I(e,t,r,o){return oe.zinc=oe.zinc||new ie(null,"        uniform sampler2D texture;        uniform vec2 texSize;        varying vec2 texCoord;        uniform sampler2D texture2;        uniform float fade;        uniform vec4 rect;        uniform float R_LU;        uniform float G_LU;        uniform float B_LU;        uniform float SAT;        void main(){            const vec3 tint=vec3(0.16,0.0,0.08);            const vec3 cyan=vec3(0.96,1.16,1.1);            vec2 p=texCoord*1.025-0.0125;            vec3 c0=(1.0-(1.0-0.5*texture2D(texture,p).rgb)*(1.0-texture2D(texture2,p).rgb));            vec3 c;            c.r=((R_LU+(1.0-R_LU)*SAT)*c0.r)+((G_LU-G_LU*SAT)*c0.g)+((B_LU-B_LU*SAT)*c0.b);            c.g=((R_LU-R_LU*SAT)*c0.r)+((G_LU+(1.0-G_LU)*SAT)*c0.g)+((B_LU-B_LU*SAT)*c0.b);            c.b=((R_LU-R_LU*SAT)*c0.r)+((G_LU-G_LU*SAT)*c0.g)+((B_LU+(1.0-B_LU)*SAT)*c0.b);            c*=cyan;            c+=tint*(1.0-c);            float bc=0.0;            if(texCoord.x<rect.t) bc=(rect.t-texCoord.x)*fade;            else if(texCoord.x>rect.q) bc=(texCoord.x-rect.q)*fade;            if(texCoord.y<rect.s) bc+=(rect.s-texCoord.y)*fade;            else if(texCoord.y>rect.p) bc+=(texCoord.y-rect.p)*fade;            gl_FragColor=vec4(clamp((c-bc),0.0,1.0),1.0);        }    "),n.call(this,oe.zinc,{R_LU:e,G_LU:t,B_LU:r,SAT:o}),this}function G(t,r){return oe.hueSaturation=oe.hueSaturation||new ie(null,"        uniform sampler2D texture;        uniform float hue;        uniform float saturation;        varying vec2 texCoord;        void main() {            vec4 color = texture2D(texture, texCoord);                        /* hue adjustment, wolfram alpha: RotationTransform[angle, {1, 1, 1}][{x, y, z}] */            float angle = hue * 3.14159265;            float s = sin(angle), c = cos(angle);            vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;            float len = length(color.rgb);            color.rgb = vec3(                dot(color.rgb, weights.xyz),                dot(color.rgb, weights.zxy),                dot(color.rgb, weights.yzx)            );                        /* saturation adjustment */            float average = (color.r + color.g + color.b) / 3.0;            if (saturation > 0.0) {                color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));            } else {                color.rgb += (average - color.rgb) * (-saturation);            }                        gl_FragColor = color;        }    "),n.call(this,oe.hueSaturation,{hue:e(-1,t,1),saturation:e(-1,r,1)}),this}function X(t){return oe.noise=oe.noise||new ie(null,"        uniform sampler2D texture;        uniform float amount;        varying vec2 texCoord;        float rand(vec2 co) {            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);        }        void main() {            vec4 color = texture2D(texture, texCoord);                        float diff = (rand(texCoord) - 0.5) * amount;            color.r += diff;            color.g += diff;            color.b += diff;                        gl_FragColor = color;        }    "),n.call(this,oe.noise,{amount:e(0,t,1)}),this}function k(t){return oe.sepia=oe.sepia||new ie(null,"        uniform sampler2D texture;        uniform float amount;        varying vec2 texCoord;        void main() {            vec4 color = texture2D(texture, texCoord);            float r = color.r;            float g = color.g;            float b = color.b;                        color.r = min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));            color.g = min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount));            color.b = min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount))));                        gl_FragColor = color;        }    "),n.call(this,oe.sepia,{amount:e(0,t,1)}),this}function O(e,t){return oe.unsharpMask=oe.unsharpMask||new ie(null,"        uniform sampler2D blurredTexture;        uniform sampler2D originalTexture;        uniform float strength;        uniform float threshold;        varying vec2 texCoord;        void main() {            vec4 blurred = texture2D(blurredTexture, texCoord);            vec4 original = texture2D(originalTexture, texCoord);            gl_FragColor = mix(blurred, original, 1.0 + strength);        }    "),this._.extraTexture.ensureFormat(this._.texture),this._.texture.use(),this._.extraTexture.drawTo(function(){ie.getDefaultShader().drawRect()}),this._.extraTexture.use(1),this.triangleBlur(e),oe.unsharpMask.textures({originalTexture:1}),n.call(this,oe.unsharpMask,{strength:t}),this._.extraTexture.unuse(1),this}function M(t){return oe.vibrance=oe.vibrance||new ie(null,"        uniform sampler2D texture;        uniform float amount;        varying vec2 texCoord;        void main() {            vec4 color = texture2D(texture, texCoord);            float average = (color.r + color.g + color.b) / 3.0;            float mx = max(color.r, max(color.g, color.b));            float amt = (mx - average) * (-amount * 3.0);            color.rgb = mix(color.rgb, vec3(mx), amt);            gl_FragColor = color;        }    "),n.call(this,oe.vibrance,{amount:e(-1,t,1)}),this}function N(t,r){return oe.vignette=oe.vignette||new ie(null,"        uniform sampler2D texture;        uniform float size;        uniform float amount;        varying vec2 texCoord;        void main() {            vec4 color = texture2D(texture, texCoord);                        float dist = distance(texCoord, vec2(0.5, 0.5));            color.rgb *= smoothstep(0.8, size * 0.799, dist * (amount + size));                        gl_FragColor = color;        }    "),n.call(this,oe.vignette,{size:e(0,t,1),amount:e(0,r,1)}),this}function W(t,r,o){oe.lensBlurPrePass=oe.lensBlurPrePass||new ie(null,"        uniform sampler2D texture;        uniform float power;        varying vec2 texCoord;        void main() {            vec4 color = texture2D(texture, texCoord);            color = pow(color, vec4(power));            gl_FragColor = vec4(color);        }    ");var i="        uniform sampler2D texture0;        uniform sampler2D texture1;        uniform vec2 delta0;        uniform vec2 delta1;        uniform float power;        varying vec2 texCoord;        "+ne+"        vec4 sample(vec2 delta) {            /* randomize the lookup values to hide the fixed number of samples */            float offset = random(vec3(delta, 151.7182), 0.0);                        vec4 color = vec4(0.0);            float total = 0.0;            for (float t = 0.0; t <= 30.0; t++) {                float percent = (t + offset) / 30.0;                color += texture2D(texture0, texCoord + delta * percent);                total += 1.0;            }            return color / total;        }    ";
      oe.lensBlur0=oe.lensBlur0||new ie(null,i+"        void main() {            gl_FragColor = sample(delta0);        }    "),oe.lensBlur1=oe.lensBlur1||new ie(null,i+"        void main() {            gl_FragColor = (sample(delta0) + sample(delta1)) * 0.5;        }    "),oe.lensBlur2=oe.lensBlur2||new ie(null,i+"        void main() {            vec4 color = (sample(delta0) + 2.0 * texture2D(texture1, texCoord)) / 3.0;            gl_FragColor = pow(color, vec4(power));        }    ").textures({texture1:1});for(var a=[],c=0;3>c;c++){var l=o+c*Math.PI*2/3;a.push([t*Math.sin(l)/this.width,t*Math.cos(l)/this.height])}var u=Math.pow(10,e(-1,r,1));return n.call(this,oe.lensBlurPrePass,{power:u}),this._.extraTexture.ensureFormat(this._.texture),n.call(this,oe.lensBlur0,{delta0:a[0]},this._.texture,this._.extraTexture),n.call(this,oe.lensBlur1,{delta0:a[1],delta1:a[2]},this._.extraTexture,this._.extraTexture),n.call(this,oe.lensBlur0,{delta0:a[1]}),this._.extraTexture.use(1),n.call(this,oe.lensBlur2,{power:1/u,delta0:a[2]}),this}function Y(e,t,r,o,i,a){oe.tiltShift=oe.tiltShift||new ie(null,"        uniform sampler2D texture;        uniform float blurRadius;        uniform float gradientRadius;        uniform vec2 start;        uniform vec2 end;        uniform vec2 delta;        uniform vec2 texSize;        varying vec2 texCoord;        "+ne+"        void main() {            vec4 color = vec4(0.0);            float total = 0.0;                        /* randomize the lookup values to hide the fixed number of samples */            float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);                        vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));            float radius = smoothstep(0.0, 1.0, abs(dot(texCoord * texSize - start, normal)) / gradientRadius) * blurRadius;            for (float t = -30.0; t <= 30.0; t++) {                float percent = (t + offset - 0.5) / 30.0;                float weight = 1.0 - abs(percent);                vec4 sample = texture2D(texture, texCoord + delta / texSize * percent * radius);                                /* switch to pre-multiplied alpha to correctly blur transparent images */                sample.rgb *= sample.a;                                color += sample * weight;                total += weight;            }                        gl_FragColor = color / total;                        /* switch back from pre-multiplied alpha */            gl_FragColor.rgb /= gl_FragColor.a + 0.00001;        }    ");var c=r-e,l=o-t,u=Math.sqrt(c*c+l*l);return n.call(this,oe.tiltShift,{blurRadius:i,gradientRadius:a,start:[e,t],end:[r,o],delta:[c/u,l/u],texSize:[this.width,this.height]}),n.call(this,oe.tiltShift,{blurRadius:i,gradientRadius:a,start:[e,t],end:[r,o],delta:[-l/u,c/u],texSize:[this.width,this.height]}),this}function q(e){return oe.triangleBlur=oe.triangleBlur||new ie(null,"        uniform sampler2D texture;        uniform vec2 delta;        varying vec2 texCoord;        "+ne+"        void main() {            vec4 color = vec4(0.0);            float total = 0.0;                        /* randomize the lookup values to hide the fixed number of samples */            float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);                        for (float t = -30.0; t <= 30.0; t++) {                float percent = (t + offset - 0.5) / 30.0;                float weight = 1.0 - abs(percent);                vec4 sample = texture2D(texture, texCoord + delta * percent);                                /* switch to pre-multiplied alpha to correctly blur transparent images */                sample.rgb *= sample.a;                                color += sample * weight;                total += weight;            }                        gl_FragColor = color / total;                        /* switch back from pre-multiplied alpha */            gl_FragColor.rgb /= gl_FragColor.a + 0.00001;        }    "),n.call(this,oe.triangleBlur,{delta:[e/this.width,0]}),n.call(this,oe.triangleBlur,{delta:[0,e/this.height]}),this}function H(e,t,r){return oe.zoomBlur=oe.zoomBlur||new ie(null,"        uniform sampler2D texture;        uniform vec2 center;        uniform float strength;        uniform vec2 texSize;        varying vec2 texCoord;        "+ne+"        void main() {            vec4 color = vec4(0.0);            float total = 0.0;            vec2 toCenter = center - texCoord * texSize;                        /* randomize the lookup values to hide the fixed number of samples */            float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);                        for (float t = 0.0; t <= 40.0; t++) {                float percent = (t + offset) / 40.0;                float weight = 4.0 * (percent - percent * percent);                vec4 sample = texture2D(texture, texCoord + toCenter * percent * strength / texSize);                                /* switch to pre-multiplied alpha to correctly blur transparent images */                sample.rgb *= sample.a;                                color += sample * weight;                total += weight;            }                        gl_FragColor = color / total;                        /* switch back from pre-multiplied alpha */            gl_FragColor.rgb /= gl_FragColor.a + 0.00001;        }    "),n.call(this,oe.zoomBlur,{center:[e,t],strength:r,texSize:[this.width,this.height]}),this}function V(e,t,r,o){return oe.colorHalftone=oe.colorHalftone||new ie(null,"        uniform sampler2D texture;        uniform vec2 center;        uniform float angle;        uniform float scale;        uniform vec2 texSize;        varying vec2 texCoord;                float pattern(float angle) {            float s = sin(angle), c = cos(angle);            vec2 tex = texCoord * texSize - center;            vec2 point = vec2(                c * tex.x - s * tex.y,                s * tex.x + c * tex.y            ) * scale;            return (sin(point.x) * sin(point.y)) * 4.0;        }                void main() {            vec4 color = texture2D(texture, texCoord);            vec3 cmy = 1.0 - color.rgb;            float k = min(cmy.x, min(cmy.y, cmy.z));            cmy = (cmy - k) / (1.0 - k);            cmy = clamp(cmy * 10.0 - 3.0 + vec3(pattern(angle + 0.26179), pattern(angle + 1.30899), pattern(angle)), 0.0, 1.0);            k = clamp(k * 10.0 - 5.0 + pattern(angle + 0.78539), 0.0, 1.0);            gl_FragColor = vec4(1.0 - cmy - k, color.a);        }    "),n.call(this,oe.colorHalftone,{center:[e,t],angle:r,scale:Math.PI/o,texSize:[this.width,this.height]}),this}function j(e,t,r,o){return oe.dotScreen=oe.dotScreen||new ie(null,"        uniform sampler2D texture;        uniform vec2 center;        uniform float angle;        uniform float scale;        uniform vec2 texSize;        varying vec2 texCoord;                float pattern() {            float s = sin(angle), c = cos(angle);            vec2 tex = texCoord * texSize - center;            vec2 point = vec2(                c * tex.x - s * tex.y,                s * tex.x + c * tex.y            ) * scale;            return (sin(point.x) * sin(point.y)) * 4.0;        }                void main() {            vec4 color = texture2D(texture, texCoord);            float average = (color.r + color.g + color.b) / 3.0;            gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);        }    "),n.call(this,oe.dotScreen,{center:[e,t],angle:r,scale:Math.PI/o,texSize:[this.width,this.height]}),this}function $(e){return oe.edgeWork1=oe.edgeWork1||new ie(null,"        uniform sampler2D texture;        uniform vec2 delta;        varying vec2 texCoord;        "+ne+"        void main() {            vec2 color = vec2(0.0);            vec2 total = vec2(0.0);                        /* randomize the lookup values to hide the fixed number of samples */            float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);                        for (float t = -30.0; t <= 30.0; t++) {                float percent = (t + offset - 0.5) / 30.0;                float weight = 1.0 - abs(percent);                vec3 sample = texture2D(texture, texCoord + delta * percent).rgb;                float average = (sample.r + sample.g + sample.b) / 3.0;                color.x += average * weight;                total.x += weight;                if (abs(t) < 15.0) {                    weight = weight * 2.0 - 1.0;                    color.y += average * weight;                    total.y += weight;                }            }            gl_FragColor = vec4(color / total, 0.0, 1.0);        }    "),oe.edgeWork2=oe.edgeWork2||new ie(null,"        uniform sampler2D texture;        uniform vec2 delta;        varying vec2 texCoord;        "+ne+"        void main() {            vec2 color = vec2(0.0);            vec2 total = vec2(0.0);                        /* randomize the lookup values to hide the fixed number of samples */            float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);                        for (float t = -30.0; t <= 30.0; t++) {                float percent = (t + offset - 0.5) / 30.0;                float weight = 1.0 - abs(percent);                vec2 sample = texture2D(texture, texCoord + delta * percent).xy;                color.x += sample.x * weight;                total.x += weight;                if (abs(t) < 15.0) {                    weight = weight * 2.0 - 1.0;                    color.y += sample.y * weight;                    total.y += weight;                }            }            float c = clamp(10000.0 * (color.y / total.y - color.x / total.x) + 0.5, 0.0, 1.0);            gl_FragColor = vec4(c, c, c, 1.0);        }    "),n.call(this,oe.edgeWork1,{delta:[e/this.width,0]}),n.call(this,oe.edgeWork2,{delta:[0,e/this.height]}),this}function K(e,t,r){return oe.hexagonalPixelate=oe.hexagonalPixelate||new ie(null,"        uniform sampler2D texture;        uniform vec2 center;        uniform float scale;        uniform vec2 texSize;        varying vec2 texCoord;        void main() {            vec2 tex = (texCoord * texSize - center) / scale;            tex.y /= 0.866025404;            tex.x -= tex.y * 0.5;                        vec2 a;            if (tex.x + tex.y - floor(tex.x) - floor(tex.y) < 1.0) a = vec2(floor(tex.x), floor(tex.y));            else a = vec2(ceil(tex.x), ceil(tex.y));            vec2 b = vec2(ceil(tex.x), floor(tex.y));            vec2 c = vec2(floor(tex.x), ceil(tex.y));                        vec3 TEX = vec3(tex.x, tex.y, 1.0 - tex.x - tex.y);            vec3 A = vec3(a.x, a.y, 1.0 - a.x - a.y);            vec3 B = vec3(b.x, b.y, 1.0 - b.x - b.y);            vec3 C = vec3(c.x, c.y, 1.0 - c.x - c.y);                        float alen = length(TEX - A);            float blen = length(TEX - B);            float clen = length(TEX - C);                        vec2 choice;            if (alen < blen) {                if (alen < clen) choice = a;                else choice = c;            } else {                if (blen < clen) choice = b;                else choice = c;            }                        choice.x += choice.y * 0.5;            choice.y *= 0.866025404;            choice *= scale / texSize;            gl_FragColor = texture2D(texture, choice + center / texSize);        }    "),n.call(this,oe.hexagonalPixelate,{center:[e,t],scale:r,texSize:[this.width,this.height]}),this}function J(e){return oe.ink=oe.ink||new ie(null,"        uniform sampler2D texture;        uniform float strength;        uniform vec2 texSize;        varying vec2 texCoord;        void main() {            vec2 dx = vec2(1.0 / texSize.x, 0.0);            vec2 dy = vec2(0.0, 1.0 / texSize.y);            vec4 color = texture2D(texture, texCoord);            float bigTotal = 0.0;            float smallTotal = 0.0;            vec3 bigAverage = vec3(0.0);            vec3 smallAverage = vec3(0.0);            for (float x = -2.0; x <= 2.0; x += 1.0) {                for (float y = -2.0; y <= 2.0; y += 1.0) {                    vec3 sample = texture2D(texture, texCoord + dx * x + dy * y).rgb;                    bigAverage += sample;                    bigTotal += 1.0;                    if (abs(x) + abs(y) < 2.0) {                        smallAverage += sample;                        smallTotal += 1.0;                    }                }            }            vec3 edge = max(vec3(0.0), bigAverage / bigTotal - smallAverage / smallTotal);            gl_FragColor = vec4(color.rgb - dot(edge, edge) * strength * 100000.0, color.a);        }    "),n.call(this,oe.ink,{strength:e*e*e*e*e,texSize:[this.width,this.height]}),this}function Q(t,r,o,i){return oe.bulgePinch=oe.bulgePinch||d("        uniform float radius;        uniform float strength;        uniform vec2 center;    ","        coord -= center;        float distance = length(coord);        if (distance < radius) {            float percent = distance / radius;            if (strength > 0.0) {                coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);            } else {                coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);            }        }        coord += center;    "),n.call(this,oe.bulgePinch,{radius:o,strength:e(-1,i,1),center:[t,r],texSize:[this.width,this.height]}),this}function Z(e,t,r){if(oe.matrixWarp=oe.matrixWarp||d("        uniform mat3 matrix;        uniform bool useTextureSpace;    ","        if (useTextureSpace) coord = coord / texSize * 2.0 - 1.0;        vec3 warp = matrix * vec3(coord, 1.0);        coord = warp.xy / warp.z;        if (useTextureSpace) coord = (coord * 0.5 + 0.5) * texSize;    "),e=Array.prototype.concat.apply([],e),4==e.length)e=[e[0],e[1],0,e[2],e[3],0,0,0,1];else if(9!=e.length)throw"can only warp with 2x2 or 3x3 matrix";return n.call(this,oe.matrixWarp,{matrix:t?f(e):e,texSize:[this.width,this.height],useTextureSpace:0|r}),this}function ee(e,t){var r=x.apply(null,t),o=x.apply(null,e),i=h(f(r),o);return this.matrixWarp(i)}function te(e,t,r,o){return oe.swirl=oe.swirl||d("        uniform float radius;        uniform float angle;        uniform vec2 center;    ","        coord -= center;        float distance = length(coord);        if (distance < radius) {            float percent = (radius - distance) / radius;            float theta = percent * percent * angle;            float s = sin(theta);            float c = cos(theta);            coord = vec2(                coord.x * c - coord.y * s,                coord.x * s + coord.y * c            );        }        coord += center;    "),n.call(this,oe.swirl,{radius:r,center:[e,t],angle:o,texSize:[this.width,this.height]}),this}var re={};!function(){function e(e){if(!e.getExtension("OES_texture_float"))return!1;var t=e.createFramebuffer(),r=e.createTexture();e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,t),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0);var o=[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],i=e.createTexture();e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,2,2,0,e.RGBA,e.FLOAT,new Float32Array(o));var a=e.createProgram(),n=e.createShader(e.VERTEX_SHADER),c=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(n,"      attribute vec2 vertex;      void main() {        gl_Position = vec4(vertex, 0.0, 1.0);      }    "),e.shaderSource(c,"      uniform sampler2D texture;      void main() {        gl_FragColor = texture2D(texture, vec2(0.5));      }    "),e.compileShader(n),e.compileShader(c),e.attachShader(a,n),e.attachShader(a,c),e.linkProgram(a);var l=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,l),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,0]),e.STREAM_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);var u=new Uint8Array(4);return e.useProgram(a),e.viewport(0,0,1,1),e.bindTexture(e.TEXTURE_2D,i),e.drawArrays(e.POINTS,0,1),e.readPixels(0,0,1,1,e.RGBA,e.UNSIGNED_BYTE,u),127===u[0]||128===u[0]}function t(){}function r(e){return void 0===e.$OES_texture_float_linear$&&Object.defineProperty(e,"$OES_texture_float_linear$",{enumerable:!1,configurable:!1,writable:!1,value:new t}),e.$OES_texture_float_linear$}function o(e){return"OES_texture_float_linear"===e?r(this):c.call(this,e)}function i(){var e=l.call(this);return-1===e.indexOf("OES_texture_float_linear")&&e.push("OES_texture_float_linear"),e}try{var a=document.createElement("canvas").getContext("experimental-webgl")}catch(n){}if(a&&-1===a.getSupportedExtensions().indexOf("OES_texture_float_linear")&&e(a)){var c=WebGLRenderingContext.prototype.getExtension,l=WebGLRenderingContext.prototype.getSupportedExtensions;WebGLRenderingContext.prototype.getExtension=o,WebGLRenderingContext.prototype.getSupportedExtensions=i}}();var oe;re.canvas=function(){var e=document.createElement("canvas");try{oe=e.getContext("experimental-webgl",{premultipliedAlpha:!1})}catch(t){oe=null}if(!oe)throw"This browser does not support WebGL";return e._={gl:oe,isInitialized:!1,texture:null,spareTexture:null,flippedShader:null},e.texture=s(r),e.draw=s(i),e.update=s(a),e.replace=s(c),e.contents=s(l),e.getPixelArray=s(u),e.brightnessContrast=s(g),e.hexagonalPixelate=s(K),e.hueSaturation=s(G),e.colorHalftone=s(V),e.triangleBlur=s(q),e.unsharpMask=s(O),e.perspective=s(ee),e.matrixWarp=s(Z),e.bulgePinch=s(Q),e.tiltShift=s(Y),e.dotScreen=s(j),e.edgeWork=s($),e.lensBlur=s(W),e.zoomBlur=s(H),e.noise=s(X),e.denoise=s(y),e.zinc=s(I),e.nightvision=s(S),e.posterize=s(z),e.murica=s(D),e.badtv=s(R),e.snow=s(U),e.fire=s(F),e.rainbow=s(P),e.cocoa=s(L),e.bokeh=s(b),e.flare=s(_),e.magazine=s(A),e.crosshatch=s(B),e.spycam=s(E),e.halo=s(C),e.smoke=s(w),e.berry=s(T),e.curves=s(p),e.swirl=s(te),e.ink=s(J),e.vignette=s(N),e.vibrance=s(M),e.sepia=s(k),e},re.splineInterpolate=v;var ie=function(){function e(e){return"[object Array]"==Object.prototype.toString.call(e)}function t(e){return"[object Number]"==Object.prototype.toString.call(e)}function r(e,t){var r=oe.createShader(e);if(oe.shaderSource(r,t),oe.compileShader(r),!oe.getShaderParameter(r,oe.COMPILE_STATUS))throw"compile error: "+oe.getShaderInfoLog(r);return r}function o(e,t){if(this.vertexAttribute=null,this.texCoordAttribute=null,this.program=oe.createProgram(),e=e||i,t=t||a,t="precision highp float;"+t,oe.attachShader(this.program,r(oe.VERTEX_SHADER,e)),oe.attachShader(this.program,r(oe.FRAGMENT_SHADER,t)),oe.linkProgram(this.program),!oe.getProgramParameter(this.program,oe.LINK_STATUS))throw"link error: "+oe.getProgramInfoLog(this.program)}var i="    attribute vec2 vertex;    attribute vec2 _texCoord;    varying vec2 texCoord;    void main() {        texCoord = _texCoord;        gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0);    }",a="    uniform sampler2D texture;    varying vec2 texCoord;    void main() {        gl_FragColor = texture2D(texture, texCoord);    }";return o.prototype.destroy=function(){oe.deleteProgram(this.program),this.program=null},o.prototype.uniforms=function(r){oe.useProgram(this.program);for(var o in r)if(r.hasOwnProperty(o)){var i=oe.getUniformLocation(this.program,o);if(null!==i){var a=r[o];if(e(a))switch(a.length){case 1:oe.uniform1fv(i,new Float32Array(a));break;case 2:oe.uniform2fv(i,new Float32Array(a));break;case 3:oe.uniform3fv(i,new Float32Array(a));break;case 4:oe.uniform4fv(i,new Float32Array(a));break;case 9:oe.uniformMatrix3fv(i,!1,new Float32Array(a));break;case 16:oe.uniformMatrix4fv(i,!1,new Float32Array(a));break;default:throw"dont't know how to load uniform \""+o+'" of length '+a.length}else{if(!t(a))throw'attempted to set uniform "'+o+'" to invalid value '+(a||"undefined").toString();oe.uniform1f(i,a)}}}return this},o.prototype.textures=function(e){oe.useProgram(this.program);for(var t in e)e.hasOwnProperty(t)&&oe.uniform1i(oe.getUniformLocation(this.program,t),e[t]);return this},o.prototype.drawRect=function(e,t,r,o){var i,a=oe.getParameter(oe.VIEWPORT);t=t!==i?(t-a[1])/a[3]:0,e=e!==i?(e-a[0])/a[2]:0,r=r!==i?(r-a[0])/a[2]:1,o=o!==i?(o-a[1])/a[3]:1,null==oe.vertexBuffer&&(oe.vertexBuffer=oe.createBuffer()),oe.bindBuffer(oe.ARRAY_BUFFER,oe.vertexBuffer),oe.bufferData(oe.ARRAY_BUFFER,new Float32Array([e,t,e,o,r,t,r,o]),oe.STATIC_DRAW),null==oe.texCoordBuffer&&(oe.texCoordBuffer=oe.createBuffer(),oe.bindBuffer(oe.ARRAY_BUFFER,oe.texCoordBuffer),oe.bufferData(oe.ARRAY_BUFFER,new Float32Array([0,0,0,1,1,0,1,1]),oe.STATIC_DRAW)),null==this.vertexAttribute&&(this.vertexAttribute=oe.getAttribLocation(this.program,"vertex"),oe.enableVertexAttribArray(this.vertexAttribute)),null==this.texCoordAttribute&&(this.texCoordAttribute=oe.getAttribLocation(this.program,"_texCoord"),oe.enableVertexAttribArray(this.texCoordAttribute)),oe.useProgram(this.program),oe.bindBuffer(oe.ARRAY_BUFFER,oe.vertexBuffer),oe.vertexAttribPointer(this.vertexAttribute,2,oe.FLOAT,!1,0,0),oe.bindBuffer(oe.ARRAY_BUFFER,oe.texCoordBuffer),oe.vertexAttribPointer(this.texCoordAttribute,2,oe.FLOAT,!1,0,0),oe.drawArrays(oe.TRIANGLE_STRIP,0,4)},o.getDefaultShader=function(){return oe.defaultShader=oe.defaultShader||new o,oe.defaultShader},o}();m.prototype.interpolate=function(e){for(var t=this.ya.length,r=0,o=t-1;o-r>1;){var i=o+r>>1;this.xa[i]>e?o=i:r=i}var a=this.xa[o]-this.xa[r],n=(this.xa[o]-e)/a,c=(e-this.xa[r])/a;return n*this.ya[r]+c*this.ya[o]+((n*n*n-n)*this.y2[r]+(c*c*c-c)*this.y2[o])*(a*a)/6};var ae=function(){function e(e,t,r,o){this.gl=oe,this.id=oe.createTexture(),this.width=e,this.height=t,this.format=r,this.type=o,oe.bindTexture(oe.TEXTURE_2D,this.id),oe.texParameteri(oe.TEXTURE_2D,oe.TEXTURE_MAG_FILTER,oe.LINEAR),oe.texParameteri(oe.TEXTURE_2D,oe.TEXTURE_MIN_FILTER,oe.LINEAR),oe.texParameteri(oe.TEXTURE_2D,oe.TEXTURE_WRAP_S,oe.CLAMP_TO_EDGE),oe.texParameteri(oe.TEXTURE_2D,oe.TEXTURE_WRAP_T,oe.CLAMP_TO_EDGE),e&&t&&oe.texImage2D(oe.TEXTURE_2D,0,this.format,e,t,0,this.format,this.type,null)}function t(e){null==r&&(r=document.createElement("canvas")),r.width=e.width,r.height=e.height;var t=r.getContext("2d");return t.clearRect(0,0,r.width,r.height),t}e.fromElement=function(t){var r=new e(0,0,oe.RGBA,oe.UNSIGNED_BYTE);return r.loadContentsOf(t),r},e.prototype.loadContentsOf=function(e){this.width=e.width||e.videoWidth,this.height=e.height||e.videoHeight,oe.bindTexture(oe.TEXTURE_2D,this.id),oe.texImage2D(oe.TEXTURE_2D,0,this.format,this.format,this.type,e)},e.prototype.initFromBytes=function(e,t,r){this.width=e,this.height=t,this.format=oe.RGBA,this.type=oe.UNSIGNED_BYTE,oe.bindTexture(oe.TEXTURE_2D,this.id),oe.texImage2D(oe.TEXTURE_2D,0,oe.RGBA,e,t,0,oe.RGBA,this.type,new Uint8Array(r))},e.prototype.destroy=function(){oe.deleteTexture(this.id),this.id=null},e.prototype.use=function(e){oe.activeTexture(oe.TEXTURE0+(e||0)),oe.bindTexture(oe.TEXTURE_2D,this.id)},e.prototype.unuse=function(e){oe.activeTexture(oe.TEXTURE0+(e||0)),oe.bindTexture(oe.TEXTURE_2D,null)},e.prototype.ensureFormat=function(e,t,r,o){if(1==arguments.length){var i=arguments[0];e=i.width,t=i.height,r=i.format,o=i.type}(e!=this.width||t!=this.height||r!=this.format||o!=this.type)&&(this.width=e,this.height=t,this.format=r,this.type=o,oe.bindTexture(oe.TEXTURE_2D,this.id),oe.texImage2D(oe.TEXTURE_2D,0,this.format,e,t,0,this.format,this.type,null))},e.prototype.drawTo=function(e){if(oe.framebuffer=oe.framebuffer||oe.createFramebuffer(),oe.bindFramebuffer(oe.FRAMEBUFFER,oe.framebuffer),oe.framebufferTexture2D(oe.FRAMEBUFFER,oe.COLOR_ATTACHMENT0,oe.TEXTURE_2D,this.id,0),oe.checkFramebufferStatus(oe.FRAMEBUFFER)!==oe.FRAMEBUFFER_COMPLETE)throw new Error("incomplete framebuffer");oe.viewport(0,0,this.width,this.height),e(),oe.bindFramebuffer(oe.FRAMEBUFFER,null)};var r=null;return e.prototype.fillUsingCanvas=function(e){return e(t(this)),this.format=oe.RGBA,this.type=oe.UNSIGNED_BYTE,oe.bindTexture(oe.TEXTURE_2D,this.id),oe.texImage2D(oe.TEXTURE_2D,0,oe.RGBA,oe.RGBA,oe.UNSIGNED_BYTE,r),this},e.prototype.toImage=function(e){this.use(),ie.getDefaultShader().drawRect();var o=this.width*this.height*4,i=new Uint8Array(o),a=t(this),n=a.createImageData(this.width,this.height);oe.readPixels(0,0,this.width,this.height,oe.RGBA,oe.UNSIGNED_BYTE,i);for(var c=0;o>c;c++)n.data[c]=i[c];a.putImageData(n,0,0),e.src=r.toDataURL()},e.prototype.swapWith=function(e){var t;t=e.id,e.id=this.id,this.id=t,t=e.width,e.width=this.width,this.width=t,t=e.height,e.height=this.height,this.height=t,t=e.format,e.format=this.format,this.format=t},e}(),ne="    float random(vec3 scale, float seed) {        /* use the fragment position for a different seed per-pixel */        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);    }";return re}();


    // JWPlayer
      jwplayer = function(e){function t(n){if(i[n])return i[n].exports;var o=i[n]={exports:{},id:n,loaded:!1};return e[n].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n=window.webpackJsonpjwplayer;window.webpackJsonpjwplayer=function(i,r){for(var a,s,l=0,c=[];l<i.length;l++)s=i[l],o[s]&&c.push.apply(c,o[s]),o[s]=0;for(a in r)e[a]=r[a];for(n&&n(i,r);c.length;)c.shift().call(null,t)};var i={},o={0:0};return t.e=function(e,n){if(0===o[e])return n.call(null,t);if(void 0!==o[e])o[e].push(n);else{o[e]=[n];var i=document.getElementsByTagName("head")[0],r=document.createElement("script");r.type="text/javascript",r.charset="utf-8",r.async=!0,r.src=t.p+""+({1:"polyfills.promise",2:"polyfills.base64",3:"provider.youtube",4:"provider.dashjs",5:"provider.shaka",6:"provider.cast"}[e]||e)+".js",i.appendChild(r)}},t.m=e,t.c=i,t.p="",t(0)}([function(e,t,n){e.exports=n(40)},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,function(e,t,n){var i,o;i=[n(41),n(174),n(45)],o=function(e,t,n){return window.jwplayer?window.jwplayer:n.extend(e,t)}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(42),n(48),n(168)],o=function(e,t){return n.p=t.loadFrom(),e.selectPlayer}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(43),n(98),n(45)],o=function(e,t,n){var i=e.selectPlayer,o=function(){var e=i.apply(this,arguments);return e?e:{registerPlugin:function(e,n,i){"jwpsrv"!==e&&t.registerPlugin(e,n,i)}}};return n.extend(e,{selectPlayer:o})}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(44),n(45),n(86),n(84),n(80),n(98)],o=function(e,t,n,i,o,r){function a(e){var r=e.getName().name;if(!t.find(o,t.matches({name:r}))){if(!t.isFunction(e.supports))throw{message:"Tried to register a provider with an invalid object"};o.unshift({name:r,supports:e.supports})}var a=function(){};a.prototype=n,e.prototype=new a,i[r]=e}var s=[],l=0,c=function(t){var n,i;return t?"string"==typeof t?(n=u(t),n||(i=document.getElementById(t))):"number"==typeof t?n=s[t]:t.nodeType&&(i=t,n=u(i.id)):n=s[0],n?n:i?d(new e(i,A)):{registerPlugin:r.registerPlugin}},u=function(e){for(var t=0;t<s.length;t++)if(s[t].id===e)return s[t];return null},d=function(e){return l++,e.uniqueId=l,s.push(e),e},A=function(e){for(var t=s.length;t--;)if(s[t].uniqueId===e.uniqueId){s.splice(t,1);break}},h={selectPlayer:c,registerProvider:a,availableProviders:o,registerPlugin:r.registerPlugin};return c.api=h,h}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(46),n(62),n(47),n(48),n(61),n(60),n(45),n(63),n(165),n(166),n(167),n(59)],o=function(e,t,n,i,o,r,a,s,l,c,u,d){var A=function(r,A){var h,p=this,f=!1,g={};a.extend(this,n),this.utils=i,this._=a,this.Events=n,this.version=d,this.trigger=function(e,t){return t=a.isObject(t)?a.extend({},t):{},t.type=e,window.jwplayer&&window.jwplayer.debug?n.trigger.call(p,e,t):n.triggerSafe.call(p,e,t)},this.dispatchEvent=this.trigger,this.removeEventListener=this.off.bind(this);var m=function(){h=new s(r),l(p,h),c(p,h),h.on(e.JWPLAYER_PLAYLIST_ITEM,function(){g={}}),h.on(e.JWPLAYER_MEDIA_META,function(e){a.extend(g,e.metadata)}),h.on(e.JWPLAYER_READY,function(e){f=!0,w.tick("ready"),e.setupTime=w.between("setup","ready")}),h.on("all",p.trigger)};m(),u(this),this.id=r.id;var w=this._qoe=new o;w.tick("init");var v=function(){f=!1,g={},p.off(),h&&h.off(),h&&h.playerDestroy&&h.playerDestroy()};return this.getPlugin=function(e){return p.plugins&&p.plugins[e]},this.addPlugin=function(e,t){this.plugins=this.plugins||{},this.plugins[e]=t,this.onReady(t.addToPlayer),t.resize&&this.onResize(t.resizeHandler)},this.setup=function(e){return w.tick("setup"),v(),m(),i.foreach(e.events,function(e,t){var n=p[e];"function"==typeof n&&n.call(p,t)}),e.id=p.id,h.setup(e,this),p},this.qoe=function(){var t=h.getItemQoe(),n=w.between("setup","ready"),i=t.between(e.JWPLAYER_MEDIA_PLAY_ATTEMPT,e.JWPLAYER_MEDIA_FIRST_FRAME);return{setupTime:n,firstFrame:i,player:w.dump(),item:t.dump()}},this.getContainer=function(){return h.getContainer?h.getContainer():r},this.getMeta=this.getItemMeta=function(){return g},this.getPlaylistItem=function(e){if(!i.exists(e))return h._model.get("playlistItem");var t=p.getPlaylist();return t?t[e]:null},this.getRenderingMode=function(){return"html5"},this.load=function(e){var t=this.getPlugin("vast")||this.getPlugin("googima");return t&&t.destroy(),h.load(e),p},this.play=function(e,n){if(a.isBoolean(e)||(n=e),n||(n={reason:"external"}),e===!0)return h.play(n),p;if(e===!1)return h.pause(),p;switch(e=p.getState()){case t.PLAYING:case t.BUFFERING:h.pause();break;default:h.play(n)}return p},this.pause=function(e){return a.isBoolean(e)?this.play(!e):this.play()},this.createInstream=function(){return h.createInstream()},this.castToggle=function(){h&&h.castToggle&&h.castToggle()},this.playAd=this.pauseAd=i.noop,this.remove=function(){return A(p),p.trigger("remove"),v(),p},this};return A}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){var e={},t=Array.prototype,n=Object.prototype,i=Function.prototype,o=t.slice,r=t.concat,a=n.toString,s=n.hasOwnProperty,l=t.map,c=t.reduce,u=t.forEach,d=t.filter,A=t.every,h=t.some,p=t.indexOf,f=Array.isArray,g=Object.keys,m=i.bind,w=function(e){return e instanceof w?e:this instanceof w?void 0:new w(e)},v=w.each=w.forEach=function(t,n,i){if(null==t)return t;if(u&&t.forEach===u)t.forEach(n,i);else if(t.length===+t.length){for(var o=0,r=t.length;r>o;o++)if(n.call(i,t[o],o,t)===e)return}else for(var a=w.keys(t),o=0,r=a.length;r>o;o++)if(n.call(i,t[a[o]],a[o],t)===e)return;return t};w.map=w.collect=function(e,t,n){var i=[];return null==e?i:l&&e.map===l?e.map(t,n):(v(e,function(e,o,r){i.push(t.call(n,e,o,r))}),i)};var y="Reduce of empty array with no initial value";w.reduce=w.foldl=w.inject=function(e,t,n,i){var o=arguments.length>2;if(null==e&&(e=[]),c&&e.reduce===c)return i&&(t=w.bind(t,i)),o?e.reduce(t,n):e.reduce(t);if(v(e,function(e,r,a){o?n=t.call(i,n,e,r,a):(n=e,o=!0)}),!o)throw new TypeError(y);return n},w.find=w.detect=function(e,t,n){var i;return E(e,function(e,o,r){return t.call(n,e,o,r)?(i=e,!0):void 0}),i},w.filter=w.select=function(e,t,n){var i=[];return null==e?i:d&&e.filter===d?e.filter(t,n):(v(e,function(e,o,r){t.call(n,e,o,r)&&i.push(e)}),i)},w.reject=function(e,t,n){return w.filter(e,function(e,i,o){return!t.call(n,e,i,o)},n)},w.compact=function(e){return w.filter(e,w.identity)},w.every=w.all=function(t,n,i){n||(n=w.identity);var o=!0;return null==t?o:A&&t.every===A?t.every(n,i):(v(t,function(t,r,a){return(o=o&&n.call(i,t,r,a))?void 0:e}),!!o)};var E=w.some=w.any=function(t,n,i){n||(n=w.identity);var o=!1;return null==t?o:h&&t.some===h?t.some(n,i):(v(t,function(t,r,a){return o||(o=n.call(i,t,r,a))?e:void 0}),!!o)};w.size=function(e){return null==e?0:e.length===+e.length?e.length:w.keys(e).length},w.after=function(e,t){return function(){return--e<1?t.apply(this,arguments):void 0}},w.before=function(e,t){var n;return function(){return--e>0&&(n=t.apply(this,arguments)),1>=e&&(t=null),n}};var j=function(e){return null==e?w.identity:w.isFunction(e)?e:w.property(e)};w.sortedIndex=function(e,t,n,i){n=j(n);for(var o=n.call(i,t),r=0,a=e.length;a>r;){var s=r+a>>>1;n.call(i,e[s])<o?r=s+1:a=s}return r};var E=w.some=w.any=function(t,n,i){n||(n=w.identity);var o=!1;return null==t?o:h&&t.some===h?t.some(n,i):(v(t,function(t,r,a){return o||(o=n.call(i,t,r,a))?e:void 0}),!!o)};w.contains=w.include=function(e,t){return null==e?!1:(e.length!==+e.length&&(e=w.values(e)),w.indexOf(e,t)>=0)},w.where=function(e,t){return w.filter(e,w.matches(t))},w.findWhere=function(e,t){return w.find(e,w.matches(t))},w.max=function(e,t,n){if(!t&&w.isArray(e)&&e[0]===+e[0]&&e.length<65535)return Math.max.apply(Math,e);var i=-(1/0),o=-(1/0);return v(e,function(e,r,a){var s=t?t.call(n,e,r,a):e;s>o&&(i=e,o=s)}),i},w.difference=function(e){var n=r.apply(t,o.call(arguments,1));return w.filter(e,function(e){return!w.contains(n,e)})},w.without=function(e){return w.difference(e,o.call(arguments,1))},w.indexOf=function(e,t,n){if(null==e)return-1;var i=0,o=e.length;if(n){if("number"!=typeof n)return i=w.sortedIndex(e,t),e[i]===t?i:-1;i=0>n?Math.max(0,o+n):n}if(p&&e.indexOf===p)return e.indexOf(t,n);for(;o>i;i++)if(e[i]===t)return i;return-1};var b=function(){};w.bind=function(e,t){var n,i;if(m&&e.bind===m)return m.apply(e,o.call(arguments,1));if(!w.isFunction(e))throw new TypeError;return n=o.call(arguments,2),i=function(){if(!(this instanceof i))return e.apply(t,n.concat(o.call(arguments)));b.prototype=e.prototype;var r=new b;b.prototype=null;var a=e.apply(r,n.concat(o.call(arguments)));return Object(a)===a?a:r}},w.partial=function(e){var t=o.call(arguments,1);return function(){for(var n=0,i=t.slice(),o=0,r=i.length;r>o;o++)i[o]===w&&(i[o]=arguments[n++]);for(;n<arguments.length;)i.push(arguments[n++]);return e.apply(this,i)}},w.once=w.partial(w.before,2),w.memoize=function(e,t){var n={};return t||(t=w.identity),function(){var i=t.apply(this,arguments);return w.has(n,i)?n[i]:n[i]=e.apply(this,arguments)}},w.delay=function(e,t){var n=o.call(arguments,2);return setTimeout(function(){return e.apply(null,n)},t)},w.defer=function(e){return w.delay.apply(w,[e,1].concat(o.call(arguments,1)))},w.throttle=function(e,t,n){var i,o,r,a=null,s=0;n||(n={});var l=function(){s=n.leading===!1?0:w.now(),a=null,r=e.apply(i,o),i=o=null};return function(){var c=w.now();s||n.leading!==!1||(s=c);var u=t-(c-s);return i=this,o=arguments,0>=u?(clearTimeout(a),a=null,s=c,r=e.apply(i,o),i=o=null):a||n.trailing===!1||(a=setTimeout(l,u)),r}},w.keys=function(e){if(!w.isObject(e))return[];if(g)return g(e);var t=[];for(var n in e)w.has(e,n)&&t.push(n);return t},w.invert=function(e){for(var t={},n=w.keys(e),i=0,o=n.length;o>i;i++)t[e[n[i]]]=n[i];return t},w.defaults=function(e){return v(o.call(arguments,1),function(t){if(t)for(var n in t)void 0===e[n]&&(e[n]=t[n])}),e},w.extend=function(e){return v(o.call(arguments,1),function(t){if(t)for(var n in t)e[n]=t[n]}),e},w.pick=function(e){var n={},i=r.apply(t,o.call(arguments,1));return v(i,function(t){t in e&&(n[t]=e[t])}),n},w.omit=function(e){var n={},i=r.apply(t,o.call(arguments,1));for(var a in e)w.contains(i,a)||(n[a]=e[a]);return n},w.clone=function(e){return w.isObject(e)?w.isArray(e)?e.slice():w.extend({},e):e},w.isArray=f||function(e){return"[object Array]"==a.call(e)},w.isObject=function(e){return e===Object(e)},v(["Arguments","Function","String","Number","Date","RegExp"],function(e){w["is"+e]=function(t){return a.call(t)=="[object "+e+"]"}}),w.isArguments(arguments)||(w.isArguments=function(e){return!(!e||!w.has(e,"callee"))}),w.isFunction=function(e){return"function"==typeof e},w.isFinite=function(e){return isFinite(e)&&!isNaN(parseFloat(e))},w.isNaN=function(e){return w.isNumber(e)&&e!=+e},w.isBoolean=function(e){return e===!0||e===!1||"[object Boolean]"==a.call(e)},w.isNull=function(e){return null===e},w.isUndefined=function(e){return void 0===e},w.has=function(e,t){return s.call(e,t)},w.identity=function(e){return e},w.constant=function(e){return function(){return e}},w.property=function(e){return function(t){return t[e]}},w.propertyOf=function(e){return null==e?function(){}:function(t){return e[t]}},w.matches=function(e){return function(t){if(t===e)return!0;for(var n in e)if(e[n]!==t[n])return!1;return!0}},w.now=Date.now||function(){return(new Date).getTime()},w.result=function(e,t){if(null!=e){var n=e[t];return w.isFunction(n)?n.call(e):n}};var C=0;return w.uniqueId=function(e){var t=++C+"";return e?e+t:t},w}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){var e={DRAG:"drag",DRAG_START:"dragStart",DRAG_END:"dragEnd",CLICK:"click",DOUBLE_CLICK:"doubleClick",TAP:"tap",DOUBLE_TAP:"doubleTap",OVER:"over",MOVE:"move",OUT:"out"},t={COMPLETE:"complete",ERROR:"error",JWPLAYER_AD_CLICK:"adClick",JWPLAYER_AD_COMPANIONS:"adCompanions",JWPLAYER_AD_COMPLETE:"adComplete",JWPLAYER_AD_ERROR:"adError",JWPLAYER_AD_IMPRESSION:"adImpression",JWPLAYER_AD_META:"adMeta",JWPLAYER_AD_PAUSE:"adPause",JWPLAYER_AD_PLAY:"adPlay",JWPLAYER_AD_SKIPPED:"adSkipped",JWPLAYER_AD_TIME:"adTime",JWPLAYER_CAST_AD_CHANGED:"castAdChanged",JWPLAYER_MEDIA_COMPLETE:"complete",JWPLAYER_READY:"ready",JWPLAYER_MEDIA_SEEK:"seek",JWPLAYER_MEDIA_BEFOREPLAY:"beforePlay",JWPLAYER_MEDIA_BEFORECOMPLETE:"beforeComplete",JWPLAYER_MEDIA_BUFFER_FULL:"bufferFull",JWPLAYER_DISPLAY_CLICK:"displayClick",JWPLAYER_PLAYLIST_COMPLETE:"playlistComplete",JWPLAYER_CAST_SESSION:"cast",JWPLAYER_MEDIA_ERROR:"mediaError",JWPLAYER_MEDIA_FIRST_FRAME:"firstFrame",JWPLAYER_MEDIA_PLAY_ATTEMPT:"playAttempt",JWPLAYER_MEDIA_LOADED:"loaded",JWPLAYER_MEDIA_SEEKED:"seeked",JWPLAYER_SETUP_ERROR:"setupError",JWPLAYER_ERROR:"error",JWPLAYER_PLAYER_STATE:"state",JWPLAYER_CAST_AVAILABLE:"castAvailable",JWPLAYER_MEDIA_BUFFER:"bufferChange",JWPLAYER_MEDIA_TIME:"time",JWPLAYER_MEDIA_TYPE:"mediaType",JWPLAYER_MEDIA_VOLUME:"volume",JWPLAYER_MEDIA_MUTE:"mute",JWPLAYER_MEDIA_META:"meta",JWPLAYER_MEDIA_LEVELS:"levels",JWPLAYER_MEDIA_LEVEL_CHANGED:"levelsChanged",JWPLAYER_CONTROLS:"controls",JWPLAYER_FULLSCREEN:"fullscreen",JWPLAYER_RESIZE:"resize",JWPLAYER_PLAYLIST_ITEM:"playlistItem",JWPLAYER_PLAYLIST_LOADED:"playlist",JWPLAYER_AUDIO_TRACKS:"audioTracks",JWPLAYER_AUDIO_TRACK_CHANGED:"audioTrackChanged",JWPLAYER_LOGO_CLICK:"logoClick",JWPLAYER_CAPTIONS_LIST:"captionsList",JWPLAYER_CAPTIONS_CHANGED:"captionsChanged",JWPLAYER_PROVIDER_CHANGED:"providerChanged",JWPLAYER_PROVIDER_FIRST_FRAME:"providerFirstFrame",JWPLAYER_USER_ACTION:"userAction",JWPLAYER_PROVIDER_CLICK:"providerClick",JWPLAYER_VIEW_TAB_FOCUS:"tabFocus",JWPLAYER_CONTROLBAR_DRAGGING:"scrubbing",JWPLAYER_INSTREAM_CLICK:"instreamClick"};return t.touchEvents=e,t}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45)],o=function(e){var t=[],n=t.slice,i={on:function(e,t,n){if(!r(this,"on",e,[t,n])||!t)return this;this._events||(this._events={});var i=this._events[e]||(this._events[e]=[]);return i.push({callback:t,context:n}),this},once:function(t,n,i){if(!r(this,"once",t,[n,i])||!n)return this;var o=this,a=e.once(function(){o.off(t,a),n.apply(this,arguments)});return a._callback=n,this.on(t,a,i)},off:function(t,n,i){var o,a,s,l,c,u,d,A;if(!this._events||!r(this,"off",t,[n,i]))return this;if(!t&&!n&&!i)return this._events=void 0,this;for(l=t?[t]:e.keys(this._events),c=0,u=l.length;u>c;c++)if(t=l[c],s=this._events[t]){if(this._events[t]=o=[],n||i)for(d=0,A=s.length;A>d;d++)a=s[d],(n&&n!==a.callback&&n!==a.callback._callback||i&&i!==a.context)&&o.push(a);o.length||delete this._events[t]}return this},trigger:function(e){if(!this._events)return this;var t=n.call(arguments,1);if(!r(this,"trigger",e,t))return this;var i=this._events[e],o=this._events.all;return i&&a(i,t,this),o&&a(o,arguments,this),this},triggerSafe:function(e){if(!this._events)return this;var t=n.call(arguments,1);if(!r(this,"trigger",e,t))return this;var i=this._events[e],o=this._events.all;return i&&s(i,t,this),o&&s(o,arguments,this),this}},o=/\s+/,r=function(e,t,n,i){if(!n)return!0;if("object"==typeof n){for(var r in n)e[t].apply(e,[r,n[r]].concat(i));return!1}if(o.test(n)){for(var a=n.split(o),s=0,l=a.length;l>s;s++)e[t].apply(e,[a[s]].concat(i));return!1}return!0},a=function(e,t,n){var i,o=-1,r=e.length,a=t[0],s=t[1],l=t[2];switch(t.length){case 0:for(;++o<r;)(i=e[o]).callback.call(i.context||n);return;case 1:for(;++o<r;)(i=e[o]).callback.call(i.context||n,a);return;case 2:for(;++o<r;)(i=e[o]).callback.call(i.context||n,a,s);return;case 3:for(;++o<r;)(i=e[o]).callback.call(i.context||n,a,s,l);return;default:for(;++o<r;)(i=e[o]).callback.apply(i.context||n,t);return}},s=function(e,t,n){for(var i,o=-1,r=e.length;++o<r;)try{(i=e[o]).callback.apply(i.context||n,t)}catch(a){}};return i}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(51),n(45),n(52),n(53),n(55),n(49),n(56),n(50),n(57),n(60)],o=function(e,t,n,i,o,r,a,s,l,c){var u={};return u.log=function(){window.console&&("object"==typeof console.log?console.log(Array.prototype.slice.call(arguments,0)):console.log.apply(console,arguments))},u.between=function(e,t,n){return Math.max(Math.min(e,n),t)},u.foreach=function(e,t){var n,i;for(n in e)"function"===u.typeOf(e.hasOwnProperty)?e.hasOwnProperty(n)&&(i=e[n],t(n,i)):(i=e[n],t(n,i))},u.indexOf=t.indexOf,u.noop=function(){},u.seconds=e.seconds,u.prefix=e.prefix,u.suffix=e.suffix,t.extend(u,r,s,n,a,i,o,l,c),u}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(50)],o=function(e,t){function n(e){return/^(?:(?:https?|file)\:)?\/\//.test(e)}function i(t){return e.some(t,function(e){return"parsererror"===e.nodeName})}var o={};return o.getAbsolutePath=function(e,i){if(t.exists(i)||(i=document.location.href),t.exists(e)){if(n(e))return e;var o,r=i.substring(0,i.indexOf("://")+3),a=i.substring(r.length,i.indexOf("/",r.length+1));if(0===e.indexOf("/"))o=e.split("/");else{var s=i.split("?")[0];s=s.substring(r.length+a.length+1,s.lastIndexOf("/")),o=s.split("/").concat(e.split("/"))}for(var l=[],c=0;c<o.length;c++)o[c]&&t.exists(o[c])&&"."!==o[c]&&(".."===o[c]?l.pop():l.push(o[c]));return r+a+"/"+l.join("/")}},o.getScriptPath=e.memoize(function(e){for(var t=document.getElementsByTagName("script"),n=0;n<t.length;n++){var i=t[n].src;if(i&&i.indexOf(e)>=0)return i.substr(0,i.indexOf(e))}return""}),o.parseXML=function(e){var t=null;try{"DOMParser"in window?(t=(new window.DOMParser).parseFromString(e,"text/xml"),(i(t.childNodes)||t.childNodes&&i(t.childNodes[0].childNodes))&&(t=null)):(t=new window.ActiveXObject("Microsoft.XMLDOM"),t.async="false",t.loadXML(e))}catch(n){}return t},o.serialize=function(e){if(void 0===e)return null;if("string"==typeof e&&e.length<6){var t=e.toLowerCase();if("true"===t)return!0;if("false"===t)return!1;if(!isNaN(Number(e))&&!isNaN(parseFloat(e)))return Number(e)}return e},o.parseDimension=function(e){return"string"==typeof e?""===e?0:e.lastIndexOf("%")>-1?e:parseInt(e.replace("px",""),10):e},o.timeFormat=function(e,t){if(0>=e&&!t)return"00:00";var n=0>e?"-":"";e=Math.abs(e);var i=Math.floor(e/3600),o=Math.floor((e-3600*i)/60),r=Math.floor(e%60);return n+(i?i+":":"")+(10>o?"0":"")+o+":"+(10>r?"0":"")+r},o.adaptiveType=function(e){if(0!==e){var t=-120;if(t>=e)return"DVR";if(0>e||e===1/0)return"LIVE"}return"VOD"},o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45)],o=function(e){var t={};return t.exists=function(e){switch(typeof e){case"string":return e.length>0;case"object":return null!==e;case"undefined":return!1}return!0},t.isHTTPS=function(){return 0===window.location.href.indexOf("https")},t.isRtmp=function(e,t){return 0===e.indexOf("rtmp")||"rtmp"===t},t.isYouTube=function(e,t){return"youtube"===t||/^(http|\/\/).*(youtube\.com|youtu\.be)\/.+/.test(e)},t.youTubeID=function(e){var t=/v[=\/]([^?&]*)|youtu\.be\/([^?]*)|^([\w-]*)$/i.exec(e);return t?t.slice(1).join("").replace("?",""):""},t.typeOf=function(t){if(null===t)return"null";var n=typeof t;return"object"===n&&e.isArray(t)?"array":n},t}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45)],o=function(e){function t(e){return e.indexOf("(format=m3u8-")>-1?"m3u8":!1}var n=function(e){return e.replace(/^\s+|\s+$/g,"")},i=function(e,t,n){for(e=""+e,n=n||"0";e.length<t;)e=n+e;return e},o=function(e,t){for(var n=0;n<e.attributes.length;n++)if(e.attributes[n].name&&e.attributes[n].name.toLowerCase()===t.toLowerCase())return e.attributes[n].value.toString();return""},r=function(e){if(!e||"rtmp"===e.substr(0,4))return"";var n=t(e);return n?n:(e=e.substring(e.lastIndexOf("/")+1,e.length).split("?")[0].split("#")[0],e.lastIndexOf(".")>-1?e.substr(e.lastIndexOf(".")+1,e.length).toLowerCase():void 0)},a=function(e){var t=parseInt(e/3600),n=parseInt(e/60)%60,o=e%60;return i(t,2)+":"+i(n,2)+":"+i(o.toFixed(3),6)},s=function(t){if(e.isNumber(t))return t;t=t.replace(",",".");var n=t.split(":"),i=0;return"s"===t.slice(-1)?i=parseFloat(t):"m"===t.slice(-1)?i=60*parseFloat(t):"h"===t.slice(-1)?i=3600*parseFloat(t):n.length>1?(i=parseFloat(n[n.length-1]),i+=60*parseFloat(n[n.length-2]),3===n.length&&(i+=3600*parseFloat(n[n.length-3]))):i=parseFloat(t),i},l=function(t,n){return e.map(t,function(e){return n+e})},c=function(t,n){return e.map(t,function(e){return e+n})};return{trim:n,pad:i,xmlAttribute:o,extension:r,hms:a,seconds:s,suffix:c,prefix:l}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45)],o=function(e){function t(e){return function(){return i(e)}}var n={},i=e.memoize(function(e){var t=navigator.userAgent.toLowerCase();return null!==t.match(e)}),o=n.isInt=function(e){return parseFloat(e)%1===0};n.isFlashSupported=function(){var e=n.flashVersion();return e&&e>=11.2},n.isFF=t(/firefox/i),n.isIPod=t(/iP(hone|od)/i),n.isIPad=t(/iPad/i),n.isSafari602=t(/Macintosh.*Mac OS X 10_8.*6\.0\.\d* Safari/i),n.isOSX=t(/Mac OS X/i),n.isEdge=t(/\sedge\/\d+/i);var r=n.isIETrident=function(e){return n.isEdge()?!0:e?(e=parseFloat(e).toFixed(1),i(new RegExp("trident/.+rv:\\s*"+e,"i"))):i(/trident/i)},a=n.isMSIE=function(e){return e?(e=parseFloat(e).toFixed(1),i(new RegExp("msie\\s*"+e,"i"))):i(/msie/i)},s=t(/chrome/i);n.isChrome=function(){return s()&&!n.isEdge()},n.isIE=function(e){return e?(e=parseFloat(e).toFixed(1),e>=11?r(e):a(e)):a()||r()},n.isSafari=function(){return i(/safari/i)&&!i(/chrome/i)&&!i(/chromium/i)&&!i(/android/i)};var l=n.isIOS=function(e){return i(e?new RegExp("iP(hone|ad|od).+\\s(OS\\s"+e+"|.*\\sVersion/"+e+")","i"):/iP(hone|ad|od)/i)};n.isAndroidNative=function(e){return c(e,!0)};var c=n.isAndroid=function(e,t){return t&&i(/chrome\/[123456789]/i)&&!i(/chrome\/18/)?!1:e?(o(e)&&!/\./.test(e)&&(e=""+e+"."),i(new RegExp("Android\\s*"+e,"i"))):i(/Android/i)};return n.isMobile=function(){return l()||c()},n.isIframe=function(){return window.frameElement&&"IFRAME"===window.frameElement.nodeName},n.flashVersion=function(){if(n.isAndroid())return 0;var e,t=navigator.plugins;if(t&&(e=t["Shockwave Flash"],e&&e.description))return parseFloat(e.description.replace(/\D+(\d+\.?\d*).*/,"$1"));if("undefined"!=typeof window.ActiveXObject){try{if(e=new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash"))return parseFloat(e.GetVariable("$version").split(" ")[1].replace(/\s*,\s*/,"."))}catch(i){return 0}return e}return 0},n}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(51),n(45),n(54)],o=function(e,t,n){var i={};i.createElement=function(e){var t=document.createElement("div");return t.innerHTML=e,t.firstChild},i.styleDimension=function(e){return e+(e.toString().indexOf("%")>0?"":"px")};var o=function(e){return t.isString(e.className)?e.className.split(" "):[]},r=function(t,n){n=e.trim(n),t.className!==n&&(t.className=n)};return i.classList=function(e){return e.classList?e.classList:o(e)},i.hasClass=n.hasClass,i.addClass=function(e,n){var i=o(e),a=t.isArray(n)?n:n.split(" ");t.each(a,function(e){t.contains(i,e)||i.push(e)}),r(e,i.join(" "))},i.removeClass=function(e,n){var i=o(e),a=t.isArray(n)?n:n.split(" ");r(e,t.difference(i,a).join(" "))},i.replaceClass=function(e,t,n){var i=e.className||"";t.test(i)?i=i.replace(t,n):n&&(i+=" "+n),r(e,i)},i.toggleClass=function(e,n,o){var r=i.hasClass(e,n);o=t.isBoolean(o)?o:!r,o!==r&&(o?i.addClass(e,n):i.removeClass(e,n))},i.emptyElement=function(e){for(;e.firstChild;)e.removeChild(e.firstChild)},i.addStyleSheet=function(e){var t=document.createElement("link");t.rel="stylesheet",t.href=e,document.getElementsByTagName("head")[0].appendChild(t)},i.empty=function(e){if(e)for(;e.childElementCount>0;)e.removeChild(e.children[0])},i.bounds=function(e){var t={left:0,right:0,width:0,height:0,top:0,bottom:0};if(!e||!document.body.contains(e))return t;var n=e.getBoundingClientRect(e),i=window.pageYOffset,o=window.pageXOffset;return n.width||n.height||n.left||n.top?(t.left=n.left+o,t.right=n.right+o,t.top=n.top+i,t.bottom=n.bottom+i,t.width=n.right-n.left,t.height=n.bottom-n.top,t):t},i}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){return{hasClass:function(e,t){var n=" "+t+" ";return 1===e.nodeType&&(" "+e.className+" ").replace(/[\t\r\n\f]/g," ").indexOf(n)>=0}}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(51)],o=function(e){function t(e){e=e.split("-");for(var t=1;t<e.length;t++)e[t]=e[t].charAt(0).toUpperCase()+e[t].slice(1);return e.join("")}function n(t,n,i){if(""===n||void 0===n||null===n)return"";var o=i?" !important":"";return"string"==typeof n&&isNaN(n)?/png|gif|jpe?g/i.test(n)&&n.indexOf("url")<0?"url("+n+")":n+o:0===n||"z-index"===t||"opacity"===t?""+n+o:/color/i.test(t)?"#"+e.pad(n.toString(16).replace(/^0x/i,""),6)+o:Math.ceil(n)+"px"+o}var i,o={},r=function(e,t){i||(i=document.createElement("style"),i.type="text/css",document.getElementsByTagName("head")[0].appendChild(i));var n=e+JSON.stringify(t).replace(/"/g,""),r=document.createTextNode(n);o[e]&&i.removeChild(o[e]),o[e]=r,i.appendChild(r)},a=function(e,i){if(void 0!==e&&null!==e){void 0===e.length&&(e=[e]);var o,r={};for(o in i)r[o]=n(o,i[o]);for(var a=0;a<e.length;a++){var s,l=e[a];if(void 0!==l&&null!==l)for(o in r)s=t(o),l.style[s]!==r[o]&&(l.style[s]=r[o])}}},s=function(e){for(var t in o)t.indexOf(e)>=0&&(i.removeChild(o[t]),delete o[t])},l=function(e,t){a(e,{transform:t,webkitTransform:t,msTransform:t,mozTransform:t,oTransform:t})},c=function(e,t){var n="rgb";e?(e=String(e).replace("#",""),3===e.length&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2])):e="000000";var i=[parseInt(e.substr(0,2),16),parseInt(e.substr(2,2),16),parseInt(e.substr(4,2),16)];return void 0!==t&&100!==t&&(n+="a",i.push(t/100)),n+"("+i.join(",")+")"};return{css:r,style:a,clearCss:s,transform:l,hexToRgba:c}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(49)],o=function(e,t){function n(e){e.onload=null,e.onprogress=null,e.onreadystatechange=null,e.onerror=null,"abort"in e&&e.abort()}function i(t,i){return function(o){var r=o.currentTarget||i.xhr;if(clearTimeout(i.timeoutId),i.retryWithoutCredentials&&i.xhr.withCredentials){n(r);var a=e.extend({},i,{xhr:null,withCredentials:!1,retryWithoutCredentials:!1});return void d(a)}i.onerror(t,i.url,r)}}function o(e){return function(t){var n=t.currentTarget||e.xhr;if(4===n.readyState){if(clearTimeout(e.timeoutId),n.status>=400){var i;return i=404===n.status?"File not found":""+n.status+"("+n.statusText+")",e.onerror(i,e.url,n)}if(200===n.status)return r(e)(t)}}}function r(e){return function(n){var i=n.currentTarget||e.xhr;if(clearTimeout(e.timeoutId),e.responseType){if("json"===e.responseType)return a(i,e)}else{var o,r=i.responseXML;if(r)try{o=r.firstChild}catch(l){}if(r&&o)return s(i,r,e);if(c&&i.responseText&&!r&&(r=t.parseXML(i.responseText),r&&r.firstChild))return s(i,r,e);if(e.requireValidXML)return void e.onerror("Invalid XML",e.url,i)}e.oncomplete(i)}}function a(t,n){if(!t.response||e.isString(t.response)&&'"'!==t.responseText.substr(1))try{t=e.extend({},t,{response:JSON.parse(t.responseText)})}catch(i){return void n.onerror("Invalid JSON",n.url,t)}return n.oncomplete(t)}function s(t,n,i){var o=n.documentElement;return i.requireValidXML&&("parsererror"===o.nodeName||o.getElementsByTagName("parsererror").length)?void i.onerror("Invalid XML",i.url,t):(t.responseXML||(t=e.extend({},t,{responseXML:n})),i.oncomplete(t))}var l=function(){},c=!1,u=function(e){var t=document.createElement("a"),n=document.createElement("a");t.href=location.href;try{return n.href=e,n.href=n.href,t.protocol+"//"+t.host!=n.protocol+"//"+n.host}catch(i){}return!0},d=function(t,a,s,d){e.isObject(t)&&(d=t,t=d.url);var A,h=e.extend({xhr:null,url:t,withCredentials:!1,retryWithoutCredentials:!1,timeout:6e4,timeoutId:-1,oncomplete:a||l,onerror:s||l,mimeType:d&&!d.responseType?"text/xml":"",requireValidXML:!1,responseType:d&&d.plainText?"text":""},d);if("XDomainRequest"in window&&u(t))A=h.xhr=new window.XDomainRequest,A.onload=r(h),A.ontimeout=A.onprogress=l,c=!0;else{if(!("XMLHttpRequest"in window))return void h.onerror("",t);A=h.xhr=new window.XMLHttpRequest,A.onreadystatechange=o(h)}var p=i("Error loading file",h);A.onerror=p,"overrideMimeType"in A?h.mimeType&&A.overrideMimeType(h.mimeType):c=!0;try{t=t.replace(/#.*$/,""),A.open("GET",t,!0)}catch(f){return p(f),A}if(h.responseType)try{A.responseType=h.responseType}catch(f){}h.timeout&&(h.timeoutId=setTimeout(function(){n(A),h.onerror("Timeout",t,A)},h.timeout));try{h.withCredentials&&"withCredentials"in A&&(A.withCredentials=!0),A.send()}catch(f){p(f)}return A};return{ajax:d,crossdomain:u}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(58),n(45),n(50),n(49),n(59)],o=function(e,t,n,i,o){var r={};return r.repo=t.memoize(function(){var t=(o.split("+")[0],e.repo);return n.isHTTPS()?t.replace(/^http:/,"https:"):t}),r.versionCheck=function(e){var t=("0"+e).split(/\W/),n=o.split(/\W/),i=parseFloat(t[0]),r=parseFloat(n[0]);return i>r?!1:!(i===r&&parseFloat("0"+t[1])>parseFloat(n[1]))},r.isSDK=function(e){return!(!e.analytics||!e.analytics.sdkplatform)},r.loadFrom=function(){return r.repo()},r}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){return{repo:"//"+appServer+"/static/"+self.version+"/",SkinsIncluded:["seven"],SkinsLoadable:["beelden","bekle","five","glow","roundster","six","stormtrooper","vapor"],dvrSeekLimit:-25}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){return"7.3.6+commercial_v7-3-6.81.commercial.f002db.jwplayer.ad873d.analytics.c31916.vast.0300bb.googima.e8ba93.plugin-sharing.08a279.plugin-related.909f55.plugin-gapro.0374cd"}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){var e=function(e,n,i){if(n=n||this,i=i||[],window.jwplayer&&window.jwplayer.debug)return e.apply(n,i);try{return e.apply(n,i)}catch(o){return new t(e.name,o)}},t=function(e,t){this.name=e,this.message=t.message||t.toString(),this.error=t};return{tryCatch:e,Error:t}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45)],o=function(e){var t=function(){var t={},n={},i={},o={};return{start:function(n){t[n]=e.now(),i[n]=i[n]+1||1},end:function(i){if(t[i]){var o=e.now()-t[i];n[i]=n[i]+o||o}},dump:function(){return{counts:i,sums:n,events:o}},tick:function(t,n){o[t]=n||e.now()},between:function(e,t){return o[t]&&o[e]?o[t]-o[e]:-1}}};return t}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){return{BUFFERING:"buffering",IDLE:"idle",COMPLETE:"complete",PAUSED:"paused",PLAYING:"playing",ERROR:"error",LOADING:"loading",STALLED:"stalled"}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(64),n(81),n(158)],o=function(e,t,i){var o=e.prototype.setup;return e.prototype.setup=function(e,r){o.apply(this,arguments);var a=this._model.get("edition"),s=t(a),l=this._model.get("cast"),c=this;s("casting")&&l&&l.appid&&n.e(6,function(e){var t=n(159);c._castController=new t(c,c._model),c.castToggle=c._castController.castToggle.bind(c._castController)});var u=i.setup();this.once("ready",u.onReady,this),r.getAdBlock=u.checkAdBlock},e}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(73),n(115),n(74),n(45),n(93),n(111),n(77),n(114),n(65),n(48),n(116),n(47),n(76),n(62),n(46),n(156)],o=function(e,t,n,i,o,r,a,s,l,c,u,d,A,h,p,f){function g(e){return function(){var t=Array.prototype.slice.call(arguments,0);this.eventsQueue.push([e,t])}}function m(e){return e===h.LOADING||e===h.STALLED?h.BUFFERING:e}var w=function(e){this.originalContainer=this.currentContainer=e,this.eventsQueue=[],i.extend(this,d),this._model=new a};return w.prototype={play:g("play"),pause:g("pause"),setVolume:g("setVolume"),setMute:g("setMute"),seek:g("seek"),stop:g("stop"),load:g("load"),playlistNext:g("playlistNext"),playlistPrev:g("playlistPrev"),playlistItem:g("playlistItem"),setFullscreen:g("setFullscreen"),setCurrentCaptions:g("setCurrentCaptions"),
      setCurrentQuality:g("setCurrentQuality"),setup:function(a,d){function f(){G.mediaModel.on("change:state",function(e,t){var n=m(t);G.set("state",n)})}function g(){K=null,R(G.get("item")),G.on("change:state",A,this),G.on("change:castState",function(e,t){ee.trigger(p.JWPLAYER_CAST_SESSION,t)}),G.on("change:fullscreen",function(e,t){ee.trigger(p.JWPLAYER_FULLSCREEN,{fullscreen:t})}),G.on("itemReady",function(){ee.trigger(p.JWPLAYER_PLAYLIST_ITEM,{index:G.get("item"),item:G.get("playlistItem")})}),G.on("change:playlist",function(e,t){t.length&&ee.trigger(p.JWPLAYER_PLAYLIST_LOADED,{playlist:t})}),G.on("change:volume",function(e,t){ee.trigger(p.JWPLAYER_MEDIA_VOLUME,{volume:t})}),G.on("change:mute",function(e,t){ee.trigger(p.JWPLAYER_MEDIA_MUTE,{mute:t})}),G.on("change:controls",function(e,t){ee.trigger(p.JWPLAYER_CONTROLS,{controls:t})}),G.on("change:scrubbing",function(e,t){t?C():j()}),G.on("change:captionsList",function(e,t){ee.trigger(p.JWPLAYER_CAPTIONS_LIST,{tracks:t,track:J()})}),G.mediaController.on("all",ee.trigger.bind(ee)),V.on("all",ee.trigger.bind(ee)),this.showView(V.element()),window.addEventListener("beforeunload",function(){K&&K.destroy(),G&&G.destroy()}),i.defer(w)}function w(){for(ee.trigger(p.JWPLAYER_READY,{setupTime:0}),ee.trigger(p.JWPLAYER_PLAYLIST_LOADED,{playlist:G.get("playlist")}),ee.trigger(p.JWPLAYER_PLAYLIST_ITEM,{index:G.get("item"),item:G.get("playlistItem")}),ee.trigger(p.JWPLAYER_CAPTIONS_LIST,{tracks:G.get("captionsList"),track:G.get("captionsIndex")}),G.get("autostart")&&j({reason:"autostart"});ee.eventsQueue.length>0;){var e=ee.eventsQueue.shift(),t=e[0],n=e[1]||[];ee[t].apply(ee,n)}}function v(e){switch(G.get("state")===h.ERROR&&G.set("state",h.IDLE),b(!0),G.get("autostart")&&G.once("itemReady",j),typeof e){case"string":y(e);break;case"object":var t=x(e);t&&R(0);break;case"number":R(e)}}function y(e){var t=new l;t.on(p.JWPLAYER_PLAYLIST_LOADED,function(e){v(e.playlist)}),t.on(p.JWPLAYER_ERROR,function(e){e.message="Error loading playlist: "+e.message,this.triggerError(e)},this),t.load(e)}function E(){var e=ee._instreamAdapter&&ee._instreamAdapter.getState();return i.isString(e)?e:G.get("state")}function j(e){var t;if(e&&G.set("playReason",e.reason),G.get("state")!==h.ERROR){var n=ee._instreamAdapter&&ee._instreamAdapter.getState();if(i.isString(n))return d.pauseAd(!1);if(G.get("state")===h.COMPLETE&&(b(!0),R(0)),!Z&&(Z=!0,ee.trigger(p.JWPLAYER_MEDIA_BEFOREPLAY,{playReason:G.get("playReason")}),Z=!1,q))return q=!1,void(X=null);if(k()){if(0===G.get("playlist").length)return!1;t=c.tryCatch(function(){G.loadVideo()})}else G.get("state")===h.PAUSED&&(t=c.tryCatch(function(){G.playVideo()}));return t instanceof c.Error?(ee.triggerError(t),X=null,!1):!0}}function b(e){G.off("itemReady",j);var t=!e;X=null;var n=c.tryCatch(function(){G.stopVideo()},ee);return n instanceof c.Error?(ee.triggerError(n),!1):(t&&($=!0),Z&&(q=!0),!0)}function C(){X=null;var e=ee._instreamAdapter&&ee._instreamAdapter.getState();if(i.isString(e))return d.pauseAd(!0);switch(G.get("state")){case h.ERROR:return!1;case h.PLAYING:case h.BUFFERING:var t=c.tryCatch(function(){te().pause()},this);if(t instanceof c.Error)return ee.triggerError(t),!1;break;default:Z&&(q=!0)}return!0}function k(){var e=G.get("state");return e===h.IDLE||e===h.COMPLETE||e===h.ERROR}function L(e){G.get("state")!==h.ERROR&&(G.get("scrubbing")||G.get("state")===h.PLAYING||j(!0),te().seek(e))}function I(e,t){b(!0),R(e),j(t)}function x(e){var t=s(e);return t=s.filterPlaylist(t,G.getProviders(),G.get("androidhls"),G.get("drm"),G.get("preload")),G.set("playlist",t),i.isArray(t)&&0!==t.length?!0:(ee.triggerError({message:"Error loading playlist: No playable sources found"}),!1)}function R(e){var t=G.get("playlist");e=(e+t.length)%t.length,G.set("item",e),G.set("playlistItem",t[e]),G.setActiveItem(t[e])}function B(e){I(G.get("item")-1,e||{reason:"external"})}function M(e){I(G.get("item")+1,e||{reason:"external"})}function T(){if(k()){if($)return void($=!1);X=T;var e=G.get("item");return e===G.get("playlist").length-1?void(G.get("repeat")?M({reason:"repeat"}):(G.set("state",h.COMPLETE),ee.trigger(p.JWPLAYER_PLAYLIST_COMPLETE,{}))):void M({reason:"playlist"})}}function P(e){te().setCurrentQuality(e)}function _(){return te()?te().getCurrentQuality():-1}function D(){return this._model?this._model.getConfiguration():void 0}function S(){if(this._model.mediaModel)return this._model.mediaModel.get("visualQuality");var e=F();if(e){var t=_(),n=e[t];if(n)return{level:i.extend({index:t},n),mode:"",reason:""}}return null}function F(){return te()?te().getQualityLevels():null}function Q(e){te()&&te().setCurrentAudioTrack(e)}function Y(){return te()?te().getCurrentAudioTrack():-1}function O(){return te()?te().getAudioTracks():null}function N(e){G.persistVideoSubtitleTrack(e),ee.trigger(p.JWPLAYER_CAPTIONS_CHANGED,{tracks:U(),track:e})}function J(){return z.getCurrentIndex()}function U(){return z.getCaptionsList()}function W(){var e=G.getVideo();if(e){var t=e.detachMedia();if(t instanceof HTMLVideoElement)return t}return null}function H(){var e=c.tryCatch(function(){G.getVideo().attachMedia()});return e instanceof c.Error?void c.log("Error calling _attachMedia",e):void("function"==typeof X&&X())}var G,V,z,K,X,q,Z=!1,$=!1,ee=this,te=function(){return G.getVideo()},ne=new e(a);G=this._model.setup(ne),V=this._view=new u(d,G),z=new r(d,G),K=new o(d,G,V,x),K.on(p.JWPLAYER_READY,g,this),K.on(p.JWPLAYER_SETUP_ERROR,this.setupError,this),G.mediaController.on(p.JWPLAYER_MEDIA_COMPLETE,function(){i.defer(T)}),G.mediaController.on(p.JWPLAYER_MEDIA_ERROR,this.triggerError,this),G.on("change:flashBlocked",function(e,t){if(!t)return void this._model.set("errorEvent",void 0);var n=!!e.get("flashThrottle"),i={message:n?"Click to run Flash":"Flash plugin failed to load"};n||this.trigger(p.JWPLAYER_ERROR,i),this._model.set("errorEvent",i)},this),f(),G.on("change:mediaModel",f),this.play=j,this.pause=C,this.seek=L,this.stop=b,this.load=v,this.playlistNext=M,this.playlistPrev=B,this.playlistItem=I,this.setCurrentCaptions=N,this.setCurrentQuality=P,this.detachMedia=W,this.attachMedia=H,this.getCurrentQuality=_,this.getQualityLevels=F,this.setCurrentAudioTrack=Q,this.getCurrentAudioTrack=Y,this.getAudioTracks=O,this.getCurrentCaptions=J,this.getCaptionsList=U,this.getVisualQuality=S,this.getConfig=D,this.getState=E,this.setVolume=G.setVolume,this.setMute=G.setMute,this.getProvider=function(){return G.get("provider")},this.getWidth=function(){return G.get("containerWidth")},this.getHeight=function(){return G.get("containerHeight")},this.getContainer=function(){return this.currentContainer},this.resize=V.resize,this.getSafeRegion=V.getSafeRegion,this.setCues=V.addCues,this.setFullscreen=function(e){i.isBoolean(e)||(e=!G.get("fullscreen")),G.set("fullscreen",e),this._instreamAdapter&&this._instreamAdapter._adModel&&this._instreamAdapter._adModel.set("fullscreen",e)},this.addButton=function(e,t,n,o,r){var a={img:e,tooltip:t,callback:n,id:o,btnClass:r},s=G.get("dock");s=s?s.slice(0):[],s=i.reject(s,i.matches({id:a.id})),s.push(a),G.set("dock",s)},this.removeButton=function(e){var t=G.get("dock")||[];t=i.reject(t,i.matches({id:e})),G.set("dock",t)},this.checkBeforePlay=function(){return Z},this.getItemQoe=function(){return G._qoeItem},this.setControls=function(e){i.isBoolean(e)||(e=!G.get("controls")),G.set("controls",e);var t=G.getVideo();t&&t.setControls(e)},this.playerDestroy=function(){this.stop(),this.showView(this.originalContainer),V&&V.destroy(),G&&G.destroy(),K&&(K.destroy(),K=null)},this.isBeforePlay=this.checkBeforePlay,this.isBeforeComplete=function(){return G.getVideo().checkComplete()},this.createInstream=function(){return this.instreamDestroy(),this._instreamAdapter=new n(this,G,V),this._instreamAdapter},this.skipAd=function(){this._instreamAdapter&&this._instreamAdapter.skipAd()},this.instreamDestroy=function(){ee._instreamAdapter&&ee._instreamAdapter.destroy()},t(d,this),K.start()},showView:function(e){(document.documentElement.contains(this.currentContainer)||(this.currentContainer=document.getElementById(this._model.get("id")),this.currentContainer))&&(this.currentContainer.parentElement&&this.currentContainer.parentElement.replaceChild(e,this.currentContainer),this.currentContainer=e)},triggerError:function(e){this._model.set("errorEvent",e),this._model.set("state",h.ERROR),this._model.once("change:state",function(){this._model.set("errorEvent",void 0)},this),this.trigger(p.JWPLAYER_ERROR,e)},setupError:function(e){var t=e.message,n=c.createElement(f(this._model.get("id"),this._model.get("skin"),t)),o=this._model.get("width"),r=this._model.get("height");c.style(n,{width:o.toString().indexOf("%")>0?o:o+"px",height:r.toString().indexOf("%")>0?r:r+"px"}),this.showView(n);var a=this;i.defer(function(){a.trigger(p.JWPLAYER_SETUP_ERROR,{message:t})})}},w}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(66),n(67),n(48),n(46),n(47),n(45)],o=function(e,t,n,i,o,r){var a=function(){function a(o){var a=n.tryCatch(function(){var n,a=o.responseXML?o.responseXML.childNodes:null,s="";if(a){for(var u=0;u<a.length&&(s=a[u],8===s.nodeType);u++);"xml"===e.localName(s)&&(s=s.nextSibling),"rss"===e.localName(s)&&(n=t.parse(s))}if(!n)try{n=JSON.parse(o.responseText),r.isArray(n)||(n=n.playlist)}catch(d){return void l("Not a valid RSS/JSON feed")}c.trigger(i.JWPLAYER_PLAYLIST_LOADED,{playlist:n})});a instanceof n.Error&&l()}function s(e){l("Playlist load error: "+e)}function l(e){c.trigger(i.JWPLAYER_ERROR,{message:e?e:"Error loading file"})}var c=r.extend(this,o);this.load=function(e){n.ajax(e,a,s)},this.destroy=function(){this.off()}};return a}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(51)],o=function(e){return{localName:function(e){return e?e.localName?e.localName:e.baseName?e.baseName:"":""},textContent:function(t){return t?t.textContent?e.trim(t.textContent):t.text?e.trim(t.text):"":""},getChildNode:function(e,t){return e.childNodes[t]},numChildren:function(e){return e.childNodes?e.childNodes.length:0}}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(51),n(66),n(68),n(69),n(70)],o=function(e,t,n,i,o){function r(t){for(var r={},s=0;s<t.childNodes.length;s++){var l=t.childNodes[s],u=c(l);if(u)switch(u.toLowerCase()){case"enclosure":r.file=e.xmlAttribute(l,"url");break;case"title":r.title=a(l);break;case"guid":r.mediaid=a(l);break;case"pubdate":r.date=a(l);break;case"description":r.description=a(l);break;case"link":r.link=a(l);break;case"category":r.tags?r.tags+=a(l):r.tags=a(l)}}return r=i(t,r),r=n(t,r),new o(r)}var a=t.textContent,s=t.getChildNode,l=t.numChildren,c=t.localName,u={};return u.parse=function(e){for(var t=[],n=0;n<l(e);n++){var i=s(e,n),o=c(i).toLowerCase();if("channel"===o)for(var a=0;a<l(i);a++){var u=s(i,a);"item"===c(u).toLowerCase()&&t.push(r(u))}}return t},u}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(66),n(51),n(48)],o=function(e,t,n){var i="jwplayer",o=function(o,r){for(var a=[],s=[],l=t.xmlAttribute,c="default",u="label",d="file",A="type",h=0;h<o.childNodes.length;h++){var p=o.childNodes[h];if(p.prefix===i){var f=e.localName(p);"source"===f?(delete r.sources,a.push({file:l(p,d),"default":l(p,c),label:l(p,u),type:l(p,A)})):"track"===f?(delete r.tracks,s.push({file:l(p,d),"default":l(p,c),kind:l(p,"kind"),label:l(p,u)})):(r[f]=n.serialize(e.textContent(p)),"file"===f&&r.sources&&delete r.sources)}r[d]||(r[d]=r.link)}if(a.length)for(r.sources=[],h=0;h<a.length;h++)a[h].file.length>0&&(a[h][c]="true"===a[h][c],a[h].label.length||delete a[h].label,r.sources.push(a[h]));if(s.length)for(r.tracks=[],h=0;h<s.length;h++)s[h].file.length>0&&(s[h][c]="true"===s[h][c],s[h].kind=s[h].kind.length?s[h].kind:"captions",s[h].label.length||delete s[h].label,r.tracks.push(s[h]));return r};return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(66),n(51),n(48)],o=function(e,t,n){var i=t.xmlAttribute,o=e.localName,r=e.textContent,a=e.numChildren,s="media",l=function(e,t){function c(e){var t={zh:"Chinese",nl:"Dutch",en:"English",fr:"French",de:"German",it:"Italian",ja:"Japanese",pt:"Portuguese",ru:"Russian",es:"Spanish"};return t[e]?t[e]:e}var u,d,A="tracks",h=[];for(d=0;d<a(e);d++)if(u=e.childNodes[d],u.prefix===s){if(!o(u))continue;switch(o(u).toLowerCase()){case"content":i(u,"duration")&&(t.duration=n.seconds(i(u,"duration"))),a(u)>0&&(t=l(u,t)),i(u,"url")&&(t.sources||(t.sources=[]),t.sources.push({file:i(u,"url"),type:i(u,"type"),width:i(u,"width"),label:i(u,"label")}));break;case"title":t.title=r(u);break;case"description":t.description=r(u);break;case"guid":t.mediaid=r(u);break;case"thumbnail":t.image||(t.image=i(u,"url"));break;case"player":break;case"group":l(u,t);break;case"subtitle":var p={};p.file=i(u,"url"),p.kind="captions",i(u,"lang").length>0&&(p.label=c(i(u,"lang"))),h.push(p)}}for(t.hasOwnProperty(A)||(t[A]=[]),d=0;d<h.length;d++)t[A].push(h[d]);return t};return l}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(71),n(72)],o=function(e,t,n){var i={sources:[],tracks:[]},o=function(o){o=o||{},e.isArray(o.tracks)||delete o.tracks;var r=e.extend({},i,o);e.isObject(r.sources)&&!e.isArray(r.sources)&&(r.sources=[t(r.sources)]),e.isArray(r.sources)&&0!==r.sources.length||(o.levels?r.sources=o.levels:r.sources=[t(o)]);for(var a=0;a<r.sources.length;a++){var s=r.sources[a];if(s){var l=s["default"];l?s["default"]="true"===l.toString():s["default"]=!1,r.sources[a].label||(r.sources[a].label=a.toString()),r.sources[a]=t(r.sources[a])}}return r.sources=e.compact(r.sources),e.isArray(r.tracks)||(r.tracks=[]),e.isArray(r.captions)&&(r.tracks=r.tracks.concat(r.captions),delete r.captions),r.tracks=e.compact(e.map(r.tracks,n)),r};return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(51),n(45)],o=function(e,t,n){var i={"default":!1},o=function(o){if(o&&o.file){var r=n.extend({},i,o);r.file=t.trim(""+r.file);var a=/^[^\/]+\/(?:x-)?([^\/]+)$/;if(e.isYouTube(r.file)?r.type="youtube":e.isRtmp(r.file)?r.type="rtmp":a.test(r.type)?r.type=r.type.replace(a,"$1"):r.type||(r.type=t.extension(r.file)),r.type){switch(r.type){case"m3u8":case"vnd.apple.mpegurl":r.type="hls";break;case"dash+xml":r.type="dash";break;case"smil":r.type="rtmp";break;case"m4a":r.type="aac"}return n.each(r,function(e,t){""===e&&delete r[t]}),r}}};return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45)],o=function(e){var t={kind:"captions","default":!1},n=function(n){return n&&n.file?e.extend({},t,n):void 0};return n}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(45)],o=function(e,t){function i(n){t.each(n,function(t,i){n[i]=e.serialize(t)})}function o(e){return e.slice&&"px"===e.slice(-2)&&(e=e.slice(0,-2)),e}function r(t,n){if(-1===n.toString().indexOf("%"))return 0;if("string"!=typeof t||!e.exists(t))return 0;if(/^\d*\.?\d+%$/.test(t))return t;var i=t.indexOf(":");if(-1===i)return 0;var o=parseFloat(t.substr(0,i)),r=parseFloat(t.substr(i+1));return 0>=o||0>=r?0:r/o*100+"%"}var a={autostart:!1,controls:!0,displaytitle:!0,displaydescription:!0,mobilecontrols:!1,repeat:!1,castAvailable:!1,skin:"seven",stretching:"uniform",mute:!1,volume:90,width:480,height:270},s=function(s){var l=t.extend({},(window.jwplayer||{}).defaults,s);i(l);var c=t.extend({},a,l);if("."===c.base&&(c.base=e.getScriptPath("jwplayer.js")),c.base=(c.base||e.loadFrom()).replace(/\/?$/,"/"),n.p=c.base,c.width=o(c.width),c.height=o(c.height),c.flashplayer=c.flashplayer||e.getScriptPath("jwplayer.js")+"static/8/jwplayer.flash.swf","http:"===window.location.protocol&&(c.flashplayer=c.flashplayer.replace("https","http")),c.aspectratio=r(c.aspectratio,c.width),t.isObject(c.skin)&&(c.skinUrl=c.skin.url,c.skinColorInactive=c.skin.inactive,c.skinColorActive=c.skin.active,c.skinColorBackground=c.skin.background,c.skin=t.isString(c.skin.name)?c.skin.name:a.skin),t.isString(c.skin)&&c.skin.indexOf(".xml")>0&&(console.log("JW Player does not support XML skins, please update your config"),c.skin=c.skin.replace(".xml","")),c.aspectratio||delete c.aspectratio,!c.playlist){var u=t.pick(c,["title","description","type","mediaid","image","file","sources","tracks","preload"]);c.playlist=[u]}return c};return s}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(75),n(92),n(46),n(62),n(48),n(47),n(45)],o=function(e,t,n,i,o,r,a){function s(n){var i=n.get("provider").name||"";return i.indexOf("flash")>=0?t:e}var l={skipoffset:null,tag:null},c=function(e,t,r){function c(e,t){t=t||{},y.tag&&!t.tag&&(t.tag=y.tag),this.trigger(e,t)}function u(e){w._adModel.set("duration",e.duration),w._adModel.set("position",e.position)}function d(e){if(A&&v+1<A.length){w._adModel.set("state","buffering"),t.set("skipButton",!1),v++;var i,o=A[v];h&&(i=h[v]),this.loadItem(o,i)}else e.type===n.JWPLAYER_MEDIA_COMPLETE&&(c.call(this,e.type,e),this.trigger(n.JWPLAYER_PLAYLIST_COMPLETE,{})),this.destroy()}var A,h,p,f,g,m=s(t),w=new m(e,t),v=0,y={},E=a.bind(function(e){e=e||{},e.hasControls=!!t.get("controls"),this.trigger(n.JWPLAYER_INSTREAM_CLICK,e),w&&w._adModel&&(w._adModel.get("state")===i.PAUSED?e.hasControls&&w.instreamPlay():w.instreamPause())},this),j=a.bind(function(){w&&w._adModel&&w._adModel.get("state")===i.PAUSED&&t.get("controls")&&(e.setFullscreen(),e.play())},this);this.type="instream",this.init=function(){p=t.getVideo(),f=t.get("position"),g=t.get("playlist")[t.get("item")],w.on("all",c,this),w.on(n.JWPLAYER_MEDIA_TIME,u,this),w.on(n.JWPLAYER_MEDIA_COMPLETE,d,this),w.init(),p.detachMedia(),t.mediaModel.set("state",i.BUFFERING),e.checkBeforePlay()||0===f&&!p.checkComplete()?(f=0,t.set("preInstreamState","instream-preroll")):p&&p.checkComplete()||t.get("state")===i.COMPLETE?t.set("preInstreamState","instream-postroll"):t.set("preInstreamState","instream-midroll");var a=t.get("state");return a!==i.PLAYING&&a!==i.BUFFERING||p.pause(),r.setupInstream(w._adModel),w._adModel.set("state",i.BUFFERING),r.clickHandler().setAlternateClickHandlers(o.noop,null),this.setText("Loading ad"),this},this.loadItem=function(e,i){if(o.isAndroid(2.3))return void this.trigger({type:n.JWPLAYER_ERROR,message:"Error loading instream: Cannot play instream on Android 2.3"});a.isArray(e)&&(A=e,h=i,e=A[v],h&&(i=h[v])),this.trigger(n.JWPLAYER_PLAYLIST_ITEM,{index:v,item:e}),y=a.extend({},l,i),w.load(e),this.addClickHandler();var r=e.skipoffset||y.skipoffset;r&&(w._adModel.set("skipMessage",y.skipMessage),w._adModel.set("skipText",y.skipText),w._adModel.set("skipOffset",r),t.set("skipButton",!0))},this.applyProviderListeners=function(e){w.applyProviderListeners(e),this.addClickHandler()},this.play=function(){w.instreamPlay()},this.pause=function(){w.instreamPause()},this.hide=function(){w.hide()},this.addClickHandler=function(){r.clickHandler().setAlternateClickHandlers(E,j),w.on(n.JWPLAYER_MEDIA_META,this.metaHandler,this)},this.skipAd=function(e){var t=n.JWPLAYER_AD_SKIPPED;this.trigger(t,e),d.call(this,{type:t})},this.metaHandler=function(e){e.width&&e.height&&r.resizeMedia()},this.destroy=function(){if(this.off(),t.set("skipButton",!1),w){r.clickHandler()&&r.clickHandler().revertAlternateClickHandlers(),w.instreamDestroy(),r.destroyInstream(),w=null,e.attachMedia();var n=t.get("preInstreamState");switch(n){case"instream-preroll":case"instream-midroll":var s=a.extend({},g);s.starttime=f,t.loadVideo(s),o.isMobile()&&t.mediaModel.get("state")===i.BUFFERING&&p.setState(i.BUFFERING),p.play();break;case"instream-postroll":case"instream-idle":p.stop()}}},this.getState=function(){return w&&w._adModel?w._adModel.get("state"):!1},this.setText=function(e){r.setAltText(e?e:"")},this.hide=function(){r.useExternalControls()}};return a.extend(c.prototype,r),c}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(47),n(76),n(46),n(62),n(77)],o=function(e,t,n,i,o,r){var a=function(a,s){function l(t){var o=t||A.getVideo();if(h!==o){if(h=o,!o)return;o.off(),o.on("all",function(t,n){n=e.extend({},n,{type:t}),this.trigger(t,n)},p),o.on(i.JWPLAYER_MEDIA_BUFFER_FULL,d),o.on(i.JWPLAYER_PLAYER_STATE,c),o.attachMedia(),o.volume(s.get("volume")),o.mute(s.get("mute")),A.on("change:state",n,p)}}function c(e){switch(e.newstate){case o.PLAYING:A.set("state",e.newstate);break;case o.PAUSED:A.set("state",e.newstate)}}function u(e){s.trigger(e.type,e),p.trigger(i.JWPLAYER_FULLSCREEN,{fullscreen:e.jwstate})}function d(){A.getVideo().play()}var A,h,p=e.extend(this,t);return a.on(i.JWPLAYER_FULLSCREEN,function(e){this.trigger(i.JWPLAYER_FULLSCREEN,e)},p),this.init=function(){A=(new r).setup({id:s.get("id"),volume:s.get("volume"),fullscreen:s.get("fullscreen"),mute:s.get("mute")}),A.on("fullscreenchange",u),this._adModel=A},p.load=function(e){A.set("item",0),A.set("playlistItem",e),A.setActiveItem(e),l(),A.off(i.JWPLAYER_ERROR),A.on(i.JWPLAYER_ERROR,function(e){this.trigger(i.JWPLAYER_ERROR,e)},p),A.loadVideo(e)},p.applyProviderListeners=function(e){l(e),e.off(i.JWPLAYER_ERROR),e.on(i.JWPLAYER_ERROR,function(e){this.trigger(i.JWPLAYER_ERROR,e)},p),s.on("change:volume",function(e,t){h.volume(t)},p),s.on("change:mute",function(e,t){h.mute(t)},p)},this.instreamDestroy=function(){A&&(A.off(),this.off(),h&&(h.detachMedia(),h.off(),A.getVideo()&&h.destroy()),A=null,a.off(null,null,this),a=null)},p.instreamPlay=function(){A.getVideo()&&A.getVideo().play(!0)},p.instreamPause=function(){A.getVideo()&&A.getVideo().pause(!0)},p};return a}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(62)],o=function(e){function t(t){return t===e.COMPLETE||t===e.ERROR?e.IDLE:t}return function(e,n,i){if(n=t(n),i=t(i),n!==i){var o=n.replace(/(?:ing|d)$/,""),r={type:o,newstate:n,oldstate:i,reason:e.mediaModel.get("state")};"play"===o&&(r.playReason=e.get("playReason")),this.trigger(o,r)}}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(78),n(89),n(90),n(45),n(47),n(91),n(46),n(62)],o=function(e,t,n,i,o,r,a,s,l){var c=["volume","mute","captionLabel","qualityLabel"],u=function(){function a(e,t){switch(e){case"flashThrottle":var n="resume"!==t.state;this.set("flashThrottle",n),this.set("flashBlocked",n);break;case"flashBlocked":return void this.set("flashBlocked",!0);case"flashUnblocked":return void this.set("flashBlocked",!1);case"volume":case"mute":return void this.set(e,t[e]);case s.JWPLAYER_MEDIA_TYPE:this.mediaModel.set("mediaType",t.mediaType);break;case s.JWPLAYER_PLAYER_STATE:return void this.mediaModel.set("state",t.newstate);case s.JWPLAYER_MEDIA_BUFFER:this.set("buffer",t.bufferPercent);case s.JWPLAYER_MEDIA_META:var i=t.duration;o.isNumber(i)&&(this.mediaModel.set("duration",i),this.set("duration",i));break;case s.JWPLAYER_MEDIA_BUFFER_FULL:this.mediaModel.get("playAttempt")?this.playVideo():this.mediaModel.on("change:playAttempt",function(){this.playVideo()},this);break;case s.JWPLAYER_MEDIA_TIME:this.mediaModel.set("position",t.position),this.set("position",t.position),o.isNumber(t.duration)&&(this.mediaModel.set("duration",t.duration),this.set("duration",t.duration));break;case s.JWPLAYER_PROVIDER_CHANGED:this.set("provider",A.getName());break;case s.JWPLAYER_MEDIA_LEVELS:this.setQualityLevel(t.currentQuality,t.levels),this.mediaModel.set("levels",t.levels);break;case s.JWPLAYER_MEDIA_LEVEL_CHANGED:this.setQualityLevel(t.currentQuality,t.levels),this.persistQualityLevel(t.currentQuality,t.levels);break;case s.JWPLAYER_AUDIO_TRACKS:this.setCurrentAudioTrack(t.currentTrack,t.tracks),this.mediaModel.set("audioTracks",t.tracks);break;case s.JWPLAYER_AUDIO_TRACK_CHANGED:this.setCurrentAudioTrack(t.currentTrack,t.tracks);break;case"subtitlesTrackChanged":this.setVideoSubtitleTrack(t.currentTrack,t.tracks);break;case"visualQuality":var r=o.extend({},t);this.mediaModel.set("visualQuality",r)}var a=o.extend({},t,{type:e});this.mediaController.trigger(e,a)}var u,A,h=this,p=e.noop;this.mediaController=o.extend({},r),this.mediaModel=new d,i.model(this),this.set("mediaModel",this.mediaModel),this.setup=function(t){var i=new n;return i.track(c,this),o.extend(this.attributes,i.getAllItems(),t,{item:0,state:l.IDLE,flashBlocked:!1,fullscreen:!1,compactUI:!1,scrubbing:!1,duration:0,position:0,buffer:0}),e.isMobile()&&!t.mobileSdk&&this.set("autostart",!1),this.updateProviders(),this},this.getConfiguration=function(){return o.omit(this.clone(),["mediaModel"])},this.updateProviders=function(){u=new t(this.getConfiguration())},this.setQualityLevel=function(e,t){e>-1&&t.length>1&&"youtube"!==A.getName().name&&this.mediaModel.set("currentLevel",parseInt(e))},this.persistQualityLevel=function(e,t){var n=t[e]||{},i=n.label;this.set("qualityLabel",i)},this.setCurrentAudioTrack=function(e,t){e>-1&&t.length>0&&e<t.length&&this.mediaModel.set("currentAudioTrack",parseInt(e))},this.onMediaContainer=function(){var e=this.get("mediaContainer");p.setContainer(e)},this.changeVideoProvider=function(e){this.off("change:mediaContainer",this.onMediaContainer),A&&(A.off(null,null,this),A.getContainer()&&A.remove()),p=new e(h.get("id"),h.getConfiguration());var t=this.get("mediaContainer");t?p.setContainer(t):this.once("change:mediaContainer",this.onMediaContainer),this.set("provider",p.getName()),-1===p.getName().name.indexOf("flash")&&(this.set("flashThrottle",void 0),this.set("flashBlocked",!1)),A=p,A.volume(h.get("volume")),A.mute(h.get("mute")),A.on("all",a,this)},this.destroy=function(){this.off(),A&&(A.off(null,null,this),A.destroy())},this.getVideo=function(){return A},this.setFullscreen=function(e){e=!!e,e!==h.get("fullscreen")&&h.set("fullscreen",e)},this.chooseProvider=function(e){return u.choose(e).provider},this.setActiveItem=function(e){this.mediaModel.off(),this.mediaModel=new d,this.set("mediaModel",this.mediaModel);var t=e&&e.sources&&e.sources[0];if(void 0!==t){var n=this.chooseProvider(t);if(!n)throw new Error("No suitable provider found");p instanceof n||h.changeVideoProvider(n),p.init&&p.init(e),this.trigger("itemReady",e)}},this.getProviders=function(){return u},this.resetProvider=function(){p=null},this.setVolume=function(e){e=Math.round(e),h.set("volume",e),A&&A.volume(e);var t=0===e;t!==h.get("mute")&&h.setMute(t)},this.setMute=function(t){if(e.exists(t)||(t=!h.get("mute")),h.set("mute",t),A&&A.mute(t),!t){var n=Math.max(10,h.get("volume"));this.setVolume(n)}},this.loadVideo=function(e){if(this.mediaModel.set("playAttempt",!0),this.mediaController.trigger(s.JWPLAYER_MEDIA_PLAY_ATTEMPT,{playReason:this.get("playReason")}),!e){var t=this.get("item");e=this.get("playlist")[t]}this.set("position",e.starttime||0),this.set("duration",e.duration||0),A.load(e)},this.stopVideo=function(){A&&A.stop()},this.playVideo=function(){A.play()},this.persistCaptionsTrack=function(){var e=this.get("captionsTrack");e?this.set("captionLabel",e.label):this.set("captionLabel","Off")},this.setVideoSubtitleTrack=function(e,t){this.set("captionsIndex",e),e&&t&&e<=t.length&&t[e-1].data&&this.set("captionsTrack",t[e-1]),A&&A.setSubtitlesTrack&&A.setSubtitlesTrack(e)},this.persistVideoSubtitleTrack=function(e){this.setVideoSubtitleTrack(e),this.persistCaptionsTrack()}},d=u.MediaModel=function(){this.set("state",l.IDLE)};return o.extend(u.prototype,a),o.extend(d.prototype,a),u}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(79)],o=function(e){return e.prototype.providerSupports=function(e,t){return e.supports(t,this.config.edition)},e}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(80),n(84),n(45)],o=function(e,t,n){function i(t){this.providers=e.slice(),this.config=t||{},"flash"===this.config.primary&&r(this.providers,"html5","flash")}function o(e,t){for(var n=0;n<e.length;n++)if(e[n].name===t)return n;return-1}function r(e,t,n){var i=o(e,t),r=o(e,n),a=e[i];e[i]=e[r],e[r]=a}return n.extend(i.prototype,{providerSupports:function(e,t){return e.supports(t)},choose:function(e){e=n.isObject(e)?e:{};for(var i=this.providers.length,o=0;i>o;o++){var r=this.providers[o];if(this.providerSupports(r,e)){var a=i-o-1;return{priority:a,name:r.name,type:e.type,provider:t[r.name]}}}return null}}),i}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(81),n(45),n(82)],o=function(e,t,n,i){function o(n,i){var o=t(i);if(!o("dash"))return!1;if(n.drm&&!o("drm"))return!1;if(!window.MediaSource)return!1;if(!e.isChrome()&&!e.isIETrident(11))return!1;var r=n.file||"";return"dash"===n.type||"mpd"===n.type||r.indexOf(".mpd")>-1||r.indexOf("mpd-time-csf")>-1}var r=n.find(i,n.matches({name:"flash"})),a=r.supports;return r.supports=function(n,i){if(!e.isFlashSupported())return!1;var o=n&&n.type;if("hls"===o||"m3u8"===o){var r=t(i);return r("hls")}return a.apply(this,arguments)},i.push({name:"dashjs",supports:n.constant(!1)}),i.push({name:"shaka",supports:o}),i}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45)],o=function(e){var t="free",n="premium",i="enterprise",o="ads",r="unlimited",a="trial",s={setup:[t,n,i,o,r,a],dash:[t,n,i,o,r,a],drm:[t,n,i,o,r,a],hls:[t,n,i,o,r,a],ads:[t,n,i,o,r,a],casting:[t,n,i,o,r,a],jwpsrv:[t,n,i,o,r,a]},l=function(t){return function(n){return e.contains(s[n],t)}};return l}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(45),n(83)],o=function(e,t,n){function i(t){if("hls"===t.type)if(t.androidhls!==!1){var n=e.isAndroidNative;if(n(2)||n(3)||n("4.0"))return!1;if(e.isAndroid())return!0}else if(e.isAndroid())return!1;return null}var o=[{name:"youtube",supports:function(t){return e.isYouTube(t.file,t.type)}},{name:"html5",supports:function(t){var o={aac:"audio/mp4",mp4:"video/mp4",f4v:"video/mp4",m4v:"video/mp4",mov:"video/mp4",mp3:"audio/mpeg",mpeg:"audio/mpeg",ogv:"video/ogg",ogg:"video/ogg",oga:"video/ogg",vorbis:"video/ogg",webm:"video/webm",f4a:"video/aac",m3u8:"application/vnd.apple.mpegurl",m3u:"application/vnd.apple.mpegurl",hls:"application/vnd.apple.mpegurl"},r=t.file,a=t.type,s=i(t);if(null!==s)return s;if(e.isRtmp(r,a))return!1;if(!o[a])return!1;if(n.canPlayType){var l=n.canPlayType(o[a]);return!!l}return!1}},{name:"flash",supports:function(n){var i={flv:"video",f4v:"video",mov:"video",m4a:"video",m4v:"video",mp4:"video",aac:"video",f4a:"video",mp3:"sound",mpeg:"sound",smil:"rtmp"},o=t.keys(i);if(!e.isFlashSupported())return!1;var r=n.file,a=n.type;return e.isRtmp(r,a)?!0:t.contains(o,a)}}];return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){return document.createElement("video")}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(85),n(87)],o=function(e,t){var n={html5:e,flash:t};return n}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(55),n(48),n(45),n(46),n(62),n(86),n(47)],o=function(e,t,n,i,o,r,a){function s(e,n){t.foreach(e,function(e,t){n.addEventListener(e,t,!1)})}function l(e,n){t.foreach(e,function(e,t){n.removeEventListener(e,t,!1)})}function c(e,t,n){"addEventListener"in e?e.addEventListener(t,n):e["on"+t]=n}function u(e,t,n){e&&("removeEventListener"in e?e.removeEventListener(t,n):e["on"+t]=null)}function d(e){if("hls"===e.type)if(e.androidhls!==!1){var n=t.isAndroidNative;if(n(2)||n(3)||n("4.0"))return!1;if(t.isAndroid())return!0}else if(t.isAndroid())return!1;return null}function A(A,C){function k(){he(Ge.audioTracks),me(Ge.textTracks)}function L(e){xe.trigger("click",e)}function I(){_e&&!Se&&(_(P()),M(ie(),ke,Ce))}function x(){_e&&M(ie(),ke,Ce)}function R(){h(Te),Be=!0,_e&&(xe.state===o.STALLED?xe.setState(o.PLAYING):xe.state===o.PLAYING&&(Te=setTimeout(ne,p)),Se&&Ge.duration===1/0&&0===Ge.currentTime||(_(P()),T(Ge.currentTime),M(ie(),ke,Ce),xe.state===o.PLAYING&&(xe.trigger(i.JWPLAYER_MEDIA_TIME,{position:ke,duration:Ce}),B())))}function B(){var e=We.level;if(e.width!==Ge.videoWidth||e.height!==Ge.videoHeight){if(e.width=Ge.videoWidth,e.height=Ge.videoHeight,ye(),!e.width||!e.height)return;We.reason=We.reason||"auto",We.mode="hls"===Ie[De].type?"auto":"manual",We.bitrate=0,e.index=De,e.label=Ie[De].label,xe.trigger("visualQuality",We),We.reason=""}}function M(e,t,n){
      e===Pe&&n===Ce||(Pe=e,xe.trigger(i.JWPLAYER_MEDIA_BUFFER,{bufferPercent:100*e,position:t,duration:n}))}function T(e){0>Ce&&(e=-($()-e)),ke=e}function P(){var e=Ge.duration,t=$();if(e===1/0&&t){var n=t-Ge.seekable.start(0);n!==1/0&&n>120&&(e=-n)}return e}function _(e){Ce=e,Me&&e&&e!==1/0&&xe.seek(Me)}function D(){var e=P();Se&&e===1/0&&(e=0),xe.trigger(i.JWPLAYER_MEDIA_META,{duration:e,height:Ge.videoHeight,width:Ge.videoWidth}),_(e)}function S(){_e&&(Be=!0,Q())}function F(){_e&&(Ge.muted&&(Ge.muted=!1,Ge.muted=!0),ye(),D())}function Q(){Le||(Le=!0,xe.trigger(i.JWPLAYER_MEDIA_BUFFER_FULL))}function Y(){xe.setState(o.PLAYING),Ge.hasAttribute("hasplayed")||Ge.setAttribute("hasplayed",""),xe.trigger(i.JWPLAYER_PROVIDER_FIRST_FRAME,{})}function O(){xe.state!==o.COMPLETE&&Ge.currentTime!==Ge.duration&&xe.setState(o.PAUSED)}function N(){Se||Ge.paused||Ge.ended||xe.state!==o.LOADING&&xe.state!==o.ERROR&&(xe.seeking||xe.setState(o.STALLED))}function J(){_e&&(t.log("Error playing media: %o %s",Ge.error,Ge.src||be.file),xe.trigger(i.JWPLAYER_MEDIA_ERROR,{message:"Error loading media: File could not be played"}))}function U(e){var i;return"array"===t.typeOf(e)&&e.length>0&&(i=n.map(e,function(e,t){return{label:e.label||t}})),i}function W(e){Ie=e,De=H(e);var t=U(e);t&&xe.trigger(i.JWPLAYER_MEDIA_LEVELS,{levels:t,currentQuality:De})}function H(e){var t=Math.max(0,De),n=C.qualityLabel;if(e)for(var i=0;i<e.length;i++)if(e[i]["default"]&&(t=i),n&&e[i].label===n)return i;return We.reason="initial choice",We.level={width:0,height:0},t}function G(){return m||w}function V(e,n,i){be=Ie[De],Me=0,h(Te);var r=document.createElement("source");r.src=be.file;var a=Ge.src!==r.src;a||G()?(Ce=n,z(i),Ge.load()):(0===e&&0!==Ge.currentTime&&(Me=-1,xe.seek(e)),Ge.play()),ke=Ge.currentTime,m&&(Q(),Ge.paused||xe.state===o.PLAYING||xe.setState(o.LOADING)),t.isIOS()&&xe.getFullScreen()&&(Ge.controls=!0),e>0&&xe.seek(e)}function z(e){if(Ye=null,Oe=null,Je=-1,Ne=-1,Ue=-1,We.reason||(We.reason="initial choice",We.level={width:0,height:0}),Be=!1,Le=!1,Se=d(be),Ge.src=be.file,be.preload&&Ge.setAttribute("preload",be.preload),e&&e.tracks){var n=t.isIOS()&&!t.isSDK(C);n&&X(e.tracks)}}function K(){Ge&&(Ge.removeAttribute("src"),!g&&Ge.load&&Ge.load())}function X(e){for(;Ge.firstChild;)Ge.removeChild(Ge.firstChild);q(e)}function q(e){if(e){Ge.setAttribute("crossorigin","anonymous");for(var t=0;t<e.length;t++)if(-1!==e[t].file.indexOf(".vtt")&&/subtitles|captions|descriptions|chapters|metadata/.test(e[t].kind)){var n=document.createElement("track");n.src=e[t].file,n.kind=e[t].kind,n.srclang=e[t].language||"",n.label=e[t].label,n.mode="disabled",Ge.appendChild(n)}}}function Z(){for(var e=Ge.seekable?Ge.seekable.length:0,t=1/0;e--;)t=Math.min(t,Ge.seekable.start(e));return t}function $(){for(var e=Ge.seekable?Ge.seekable.length:0,t=0;e--;)t=Math.max(t,Ge.seekable.end(e));return t}function ee(){xe.seeking=!1,xe.trigger(i.JWPLAYER_MEDIA_SEEKED)}function te(){xe.trigger("volume",{volume:Math.round(100*Ge.volume)}),xe.trigger("mute",{mute:Ge.muted})}function ne(){Ge.currentTime===ke&&N()}function ie(){var e=Ge.buffered,n=Ge.duration;return!e||0===e.length||0>=n||n===1/0?0:t.between(e.end(e.length-1)/n,0,1)}function oe(){if(_e&&xe.state!==o.IDLE&&xe.state!==o.COMPLETE){if(h(Te),De=-1,Fe=!0,xe.trigger(i.JWPLAYER_MEDIA_BEFORECOMPLETE),!_e)return;re()}}function re(){h(Te),xe.setState(o.COMPLETE),Fe=!1,xe.trigger(i.JWPLAYER_MEDIA_COMPLETE)}function ae(e){Qe=!0,Ae(e),t.isIOS()&&(Ge.controls=!1)}function se(){var e=-1,t=0;if(Ye)for(t;t<Ye.length;t++)if("showing"===Ye[t].mode){e=t;break}we(e+1)}function le(){for(var e=-1,t=0;t<Ge.audioTracks.length;t++)if(Ge.audioTracks[t].enabled){e=t;break}pe(e)}function ce(e){ue(e.currentTarget.activeCues)}function ue(e){if(e&&e.length&&Ue!==e[0].startTime){var t={TIT2:"title",TT2:"title",WXXX:"url",TPE1:"artist",TP1:"artist",TALB:"album",TAL:"album"},i=function(e,t){var n,i,o,r,a,s;for(n="",o=e.length,i=t||0;o>i;)switch(r=e[i++],r>>4){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:n+=String.fromCharCode(r);break;case 12:case 13:a=e[i++],n+=String.fromCharCode((31&r)<<6|63&a);break;case 14:a=e[i++],s=e[i++],n+=String.fromCharCode((15&r)<<12|(63&a)<<6|(63&s)<<0)}return n},o=function(e,t){var n,i,o;for(n="",o=e.length,i=t||0;o>i;)254===e[i]&&255===e[i+1]||(n+=String.fromCharCode((e[i]<<8)+e[i+1])),i+=2;return n},r=n.reduce(e,function(e,r){if(!("value"in r)&&"data"in r&&r.data instanceof ArrayBuffer){var a=r,s=new Uint8Array(a.data);r={value:{key:"",data:""}};for(var l=10;14>l&&l<s.length&&0!==s[l];)r.value.key+=String.fromCharCode(s[l]),l++;var c=s[20];1===c||2===c?r.value.data=o(s,21):r.value.data=i(s,21)}if(t.hasOwnProperty(r.value.key)&&(e[t[r.value.key]]=r.value.data),r.value.info){var u=e[r.value.key];n.isObject(u)||(u={},e[r.value.key]=u),u[r.value.info]=r.value.data}else e[r.value.key]=r.value.data;return e},{});Ue=e[0].startTime,xe.trigger("meta",{metadataTime:Ue,metadata:r})}}function de(e){Qe=!1,Ae(e),t.isIOS()&&(Ge.controls=!1)}function Ae(e){xe.trigger("fullscreenchange",{target:e.target,jwstate:Qe})}function he(e){if(Oe=null,e){if(e.length){for(var t=0;t<e.length;t++)if(e[t].enabled){Je=t;break}-1===Je&&(Je=0,e[Je].enabled=!0),Oe=n.map(e,function(e){var t={name:e.label||e.language,language:e.language};return t})}c(e,"change",le),Oe&&xe.trigger("audioTracks",{currentTrack:Je,tracks:Oe})}}function pe(e){Ge&&Ge.audioTracks&&Oe&&e>-1&&e<Ge.audioTracks.length&&e!==Je&&(Ge.audioTracks[Je].enabled=!1,Je=e,Ge.audioTracks[Je].enabled=!0,xe.trigger("audioTrackChanged",{currentTrack:Je,tracks:Oe}))}function fe(){return Oe||[]}function ge(){return Je}function me(e){if(Ye=null,e){if(e.length){var t=0,n=e.length;for(t;n>t;t++)"metadata"===e[t].kind?(e[t].oncuechange=ce,e[t].mode="showing"):"subtitles"!==e[t].kind&&"captions"!==e[t].kind||(e[t].mode="disabled",Ye||(Ye=[]),Ye.push(e[t]))}c(e,"change",se),Ye&&Ye.length&&xe.trigger("subtitlesTracks",{tracks:Ye})}}function we(e){Ye&&Ne!==e-1&&(Ne>-1&&Ne<Ye.length?Ye[Ne].mode="disabled":n.each(Ye,function(e){e.mode="disabled"}),e>0&&e<=Ye.length?(Ne=e-1,Ye[Ne].mode="showing"):Ne=-1,xe.trigger("subtitlesTrackChanged",{currentTrack:Ne+1,tracks:Ye}))}function ve(){return Ne}function ye(){if("hls"===Ie[0].type){var e="video";0===Ge.videoWidth&&(e="audio"),xe.trigger("mediaType",{mediaType:e})}}function Ee(){Ye&&Ye[Ne]&&(Ye[Ne].mode="disabled")}this.state=o.IDLE,this.seeking=!1,n.extend(this,a),this.trigger=function(e,t){return _e?a.trigger.call(this,e,t):void 0},this.setState=function(e){return _e?r.setState.call(this,e):void 0};var je,be,Ce,ke,Le,Ie,xe=this,Re={click:L,durationchange:I,ended:oe,error:J,loadeddata:k,loadedmetadata:F,canplay:S,playing:Y,progress:x,pause:O,seeked:ee,timeupdate:R,volumechange:te,webkitbeginfullscreen:ae,webkitendfullscreen:de},Be=!1,Me=0,Te=-1,Pe=-1,_e=!0,De=-1,Se=null,Fe=!1,Qe=!1,Ye=null,Oe=null,Ne=-1,Je=-1,Ue=-1,We={level:{}},He=document.getElementById(A),Ge=He?He.querySelector("video"):void 0;Ge=Ge||document.createElement("video"),Ge.className="jw-video jw-reset",s(Re,Ge),E||(Ge.controls=!0,Ge.controls=!1),Ge.setAttribute("x-webkit-airplay","allow"),Ge.setAttribute("webkit-playsinline",""),this.stop=function(){h(Te),_e&&(K(),t.isIETrident()&&Ge.pause(),De=-1,this.setState(o.IDLE))},this.destroy=function(){l(Re,Ge),u(Ge.audioTracks,"change",le),u(Ge.textTracks,"change",se),this.remove(),this.off()},this.init=function(e){_e&&(Ie=e.sources,De=H(e.sources),e.sources.length&&"hls"!==e.sources[0].type&&this.sendMediaType(e.sources),be=Ie[De],ke=e.starttime||0,Ce=e.duration||0,We.reason="",z(e))},this.load=function(e){_e&&(W(e.sources),e.sources.length&&"hls"!==e.sources[0].type&&this.sendMediaType(e.sources),m&&!Ge.hasAttribute("hasplayed")||xe.setState(o.LOADING),V(e.starttime||0,e.duration||0,e))},this.play=function(){return xe.seeking?(xe.setState(o.LOADING),void xe.once(i.JWPLAYER_MEDIA_SEEKED,xe.play)):void Ge.play()},this.pause=function(){h(Te),Ge.pause(),this.setState(o.PAUSED)},this.seek=function(e){if(_e)if(0>e&&(e+=Z()+$()),0===Me&&this.trigger(i.JWPLAYER_MEDIA_SEEK,{position:Ge.currentTime,offset:e}),Be||(Be=!!$()),Be){Me=0;try{xe.seeking=!0,Ge.currentTime=e}catch(t){xe.seeking=!1,Me=e}}else Me=e,v&&Ge.paused&&Ge.play()},this.volume=function(e){e=t.between(e/100,0,1),Ge.volume=e},this.mute=function(e){Ge.muted=!!e},this.checkComplete=function(){return Fe},this.detachMedia=function(){return h(Te),Ee(),_e=!1,Ge},this.attachMedia=function(){_e=!0,Be=!1,this.seeking=!1,Ge.loop=!1,Fe&&re()},this.setContainer=function(e){je=e,e.appendChild(Ge)},this.getContainer=function(){return je},this.remove=function(){K(),h(Te),De=-1,je===Ge.parentNode&&je.removeChild(Ge)},this.setVisibility=function(t){t=!!t,t||y?e.style(je,{visibility:"visible",opacity:1}):e.style(je,{visibility:"",opacity:0})},this.resize=function(t,n,i){if(!(t&&n&&Ge.videoWidth&&Ge.videoHeight))return!1;var o={objectFit:""};if("uniform"===i){var r=t/n,a=Ge.videoWidth/Ge.videoHeight;Math.abs(r-a)<.09&&(o.objectFit="fill",i="exactfit")}var s=f||y||E||j;if(s){var l=-Math.floor(Ge.videoWidth/2+1),c=-Math.floor(Ge.videoHeight/2+1),u=Math.ceil(100*t/Ge.videoWidth)/100,d=Math.ceil(100*n/Ge.videoHeight)/100;"none"===i?u=d=1:"fill"===i?u=d=Math.max(u,d):"uniform"===i&&(u=d=Math.min(u,d)),o.width=Ge.videoWidth,o.height=Ge.videoHeight,o.top=o.left="50%",o.margin=0,e.transform(Ge,"translate("+l+"px, "+c+"px) scale("+u.toFixed(2)+", "+d.toFixed(2)+")")}return e.style(Ge,o),!1},this.setFullscreen=function(e){if(e=!!e){var n=t.tryCatch(function(){var e=Ge.webkitEnterFullscreen||Ge.webkitEnterFullScreen;e&&e.apply(Ge)});return n instanceof t.Error?!1:xe.getFullScreen()}var i=Ge.webkitExitFullscreen||Ge.webkitExitFullScreen;return i&&i.apply(Ge),e},xe.getFullScreen=function(){return Qe||!!Ge.webkitDisplayingFullscreen},this.setCurrentQuality=function(e){if(De!==e&&(e=parseInt(e,10),e>=0&&Ie&&Ie.length>e)){De=e,We.reason="api",We.level={width:0,height:0},this.trigger(i.JWPLAYER_MEDIA_LEVEL_CHANGED,{currentQuality:e,levels:U(Ie)}),C.qualityLabel=Ie[e].label;var t=Ge.currentTime||0,n=Ge.duration||0;0>=n&&(n=Ce),xe.setState(o.LOADING),V(t,n)}},this.getCurrentQuality=function(){return De},this.getQualityLevels=function(){return U(Ie)},this.getName=function(){return{name:b}},this.setCurrentAudioTrack=pe,this.getAudioTracks=fe,this.getCurrentAudioTrack=ge,this.setSubtitlesTrack=we,this.getSubtitlesTrack=ve}var h=window.clearTimeout,p=256,f=t.isIE(),g=t.isMSIE(),m=t.isMobile(),w=t.isSafari(),v=t.isFF(),y=t.isAndroidNative(),E=t.isIOS(7),j=t.isIOS(8),b="html5",C=function(){};return C.prototype=r,A.prototype=new C,A}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(46),n(62),n(45)],o=function(e,t,n,i){var o=e.noop,r=i.constant(!1),a={supports:r,play:o,load:o,stop:o,volume:o,mute:o,seek:o,resize:o,remove:o,destroy:o,setVisibility:o,setFullscreen:r,getFullscreen:o,getContainer:o,setContainer:r,getName:o,getQualityLevels:o,getCurrentQuality:o,setCurrentQuality:o,getAudioTracks:o,getCurrentAudioTrack:o,setCurrentAudioTrack:o,checkComplete:o,setControls:o,attachMedia:o,detachMedia:o,setState:function(e){var i=this.state||n.IDLE;this.state=e,e!==i&&this.trigger(t.JWPLAYER_PLAYER_STATE,{newstate:e})},sendMediaType:function(e){var n=e[0].type,i="oga"===n||"aac"===n||"mp3"===n||"mpeg"===n||"vorbis"===n;this.trigger(t.JWPLAYER_MEDIA_TYPE,{mediaType:i?"audio":"video"})}};return a}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(45),n(46),n(62),n(88),n(86),n(47)],o=function(e,t,n,i,o,r,a){function s(e){return e+"_swf_"+u++}function l(t){var n=document.createElement("a");n.href=t.flashplayer;var i=n.hostname===window.location.host;return e.isChrome()&&!i}function c(c,u){function d(e){if(T)for(var t=0;t<e.length;t++){var n=e[t];if(n.bitrate){var i=Math.round(n.bitrate/1e3);n.label=A(i)}}}function A(e){var t=T[e];if(!t){for(var n=1/0,i=T.bitrates.length;i--;){var o=Math.abs(T.bitrates[i]-e);if(o>n)break;n=o}t=T.labels[T.bitrates[i+1]],T[e]=t}return t}function h(){var e=u.hlslabels;if(!e)return null;var t={},n=[];for(var i in e){var o=parseFloat(i);if(!isNaN(o)){var r=Math.round(o);t[r]=e[i],n.push(r)}}return 0===n.length?null:(n.sort(function(e,t){return e-t}),{labels:t,bitrates:n})}function p(){E=setTimeout(function(){a.trigger.call(R,"flashBlocked")},4e3),w.once("embedded",function(){g(),a.trigger.call(R,"flashUnblocked")},R)}function f(){g(),p()}function g(){clearTimeout(E),window.removeEventListener("focus",f)}var m,w,v,y=null,E=-1,j=!1,b=-1,C=null,k=-1,L=null,I=!0,x=!1,R=this,B=function(){return w&&w.__ready},M=function(){w&&w.triggerFlash.apply(w,arguments)},T=h();t.extend(this,a,{init:function(e){e.preload&&"none"!==e.preload&&!u.autostart&&(y=e)},load:function(e){y=e,j=!1,this.setState(i.LOADING),M("load",e),e.sources.length&&"hls"!==e.sources[0].type&&this.sendMediaType(e.sources)},play:function(){M("play")},pause:function(){M("pause"),this.setState(i.PAUSED)},stop:function(){M("stop"),b=-1,y=null,this.setState(i.IDLE)},seek:function(e){M("seek",e)},volume:function(e){if(t.isNumber(e)){var n=Math.min(Math.max(0,e),100);B()&&M("volume",n)}},mute:function(e){B()&&M("mute",e)},setState:function(){return r.setState.apply(this,arguments)},checkComplete:function(){return j},attachMedia:function(){I=!0,j&&(this.setState(i.COMPLETE),this.trigger(n.JWPLAYER_MEDIA_COMPLETE),j=!1)},detachMedia:function(){return I=!1,null},getSwfObject:function(e){var t=e.getElementsByTagName("object")[0];return t?(t.off(null,null,this),t):o.embed(u.flashplayer,e,s(c),u.wmode)},getContainer:function(){return m},setContainer:function(o){if(m!==o){m=o,w=this.getSwfObject(o),document.hasFocus()?p():window.addEventListener("focus",f),w.once("ready",function(){g(),w.once("pluginsLoaded",function(){w.queueCommands=!1,M("setupCommandQueue",w.__commandQueue),w.__commandQueue=[]});var e=t.extend({},u),i=w.triggerFlash("setup",e);i===w?w.__ready=!0:this.trigger(n.JWPLAYER_MEDIA_ERROR,i),y&&M("init",y)},this);var r=[n.JWPLAYER_MEDIA_META,n.JWPLAYER_MEDIA_ERROR,n.JWPLAYER_MEDIA_SEEK,n.JWPLAYER_MEDIA_SEEKED,"subtitlesTracks","subtitlesTrackChanged","subtitlesTrackData","mediaType"],s=[n.JWPLAYER_MEDIA_BUFFER,n.JWPLAYER_MEDIA_TIME],c=[n.JWPLAYER_MEDIA_BUFFER_FULL];w.on(n.JWPLAYER_MEDIA_LEVELS,function(e){d(e.levels),b=e.currentQuality,C=e.levels,this.trigger(e.type,e)},this),w.on(n.JWPLAYER_MEDIA_LEVEL_CHANGED,function(e){d(e.levels),b=e.currentQuality,C=e.levels,this.trigger(e.type,e)},this),w.on(n.JWPLAYER_AUDIO_TRACKS,function(e){k=e.currentTrack,L=e.tracks,this.trigger(e.type,e)},this),w.on(n.JWPLAYER_AUDIO_TRACK_CHANGED,function(e){k=e.currentTrack,L=e.tracks,this.trigger(e.type,e)},this),w.on(n.JWPLAYER_PLAYER_STATE,function(e){var t=e.newstate;t!==i.IDLE&&this.setState(t)},this),w.on(s.join(" "),function(e){"Infinity"===e.duration&&(e.duration=1/0),this.trigger(e.type,e)},this),w.on(r.join(" "),function(e){this.trigger(e.type,e)},this),w.on(c.join(" "),function(e){this.trigger(e.type)},this),w.on(n.JWPLAYER_MEDIA_BEFORECOMPLETE,function(e){j=!0,this.trigger(e.type),I===!0&&(j=!1)},this),w.on(n.JWPLAYER_MEDIA_COMPLETE,function(e){j||(this.setState(i.COMPLETE),this.trigger(e.type))},this),w.on("visualQuality",function(e){e.reason=e.reason||"api",this.trigger("visualQuality",e),this.trigger(n.JWPLAYER_PROVIDER_FIRST_FRAME,{})},this),w.on(n.JWPLAYER_PROVIDER_CHANGED,function(e){v=e.message,this.trigger(n.JWPLAYER_PROVIDER_CHANGED,e)},this),w.on(n.JWPLAYER_ERROR,function(t){e.log("Error playing media: %o %s",t.code,t.message,t),this.trigger(n.JWPLAYER_MEDIA_ERROR,t)},this),l(u)&&w.on("throttle",function(e){g(),"resume"===e.state?a.trigger.call(R,"flashThrottle",e):E=setTimeout(function(){a.trigger.call(R,"flashThrottle",e)},250)},this)}},remove:function(){b=-1,C=null,o.remove(w)},setVisibility:function(e){e=!!e,m.style.opacity=e?1:0},resize:function(e,t,n){n&&M("stretch",n)},setControls:function(e){M("setControls",e)},setFullscreen:function(e){x=e,M("fullscreen",e)},getFullScreen:function(){return x},setCurrentQuality:function(e){M("setCurrentQuality",e)},getCurrentQuality:function(){return b},setSubtitlesTrack:function(e){M("setSubtitlesTrack",e)},getName:function(){return v?{name:"flash_"+v}:{name:"flash"}},getQualityLevels:function(){return C||y.sources},getAudioTracks:function(){return L},getCurrentAudioTrack:function(){return k},setCurrentAudioTrack:function(e){M("setCurrentAudioTrack",e)},destroy:function(){g(),this.remove(),w&&(w.off(),w=null),m=null,y=null,this.off()}}),this.trigger=function(e,t){return I?a.trigger.call(this,e,t):void 0}}var u=0,d=function(){};return d.prototype=r,c.prototype=new d,c}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(47),n(45)],o=function(e,t,n){function i(e,t,n){var i=document.createElement("param");i.setAttribute("name",t),i.setAttribute("value",n),e.appendChild(i)}function o(o,r,l,c){var u;if(c=c||"opaque",e.isMSIE()){var d=document.createElement("div");r.appendChild(d),d.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%" id="'+l+'" name="'+l+'" tabindex="0"><param name="movie" value="'+o+'"><param name="allowfullscreen" value="true"><param name="allowscriptaccess" value="always"><param name="wmode" value="'+c+'"><param name="bgcolor" value="'+s+'"><param name="menu" value="false"></object>';for(var A=r.getElementsByTagName("object"),h=A.length;h--;)A[h].id===l&&(u=A[h])}else u=document.createElement("object"),u.setAttribute("type","application/x-shockwave-flash"),u.setAttribute("data",o),u.setAttribute("width","100%"),u.setAttribute("height","100%"),u.setAttribute("bgcolor",s),u.setAttribute("id",l),u.setAttribute("name",l),i(u,"allowfullscreen","true"),i(u,"allowscriptaccess","always"),i(u,"wmode",c),i(u,"menu","false"),r.appendChild(u,r);return u.className="jw-swf jw-reset",u.style.display="block",u.style.position="absolute",u.style.left=0,u.style.right=0,u.style.top=0,u.style.bottom=0,n.extend(u,t),u.queueCommands=!0,u.triggerFlash=function(t){var i=this;if("setup"!==t&&i.queueCommands||!i.__externalCall){for(var o=i.__commandQueue,r=o.length;r--;)o[r][0]===t&&o.splice(r,1);return o.push(Array.prototype.slice.call(arguments)),i}var s=Array.prototype.slice.call(arguments,1),l=e.tryCatch(function(){if(s.length){for(var e=s.length;e--;)"object"==typeof s[e]&&n.each(s[e],a);var o=JSON.stringify(s);i.__externalCall(t,o)}else i.__externalCall(t)});return l instanceof e.Error&&(console.error(t,l),"setup"===t)?(l.name="Failed to setup flash",l):i},u.__commandQueue=[],u}function r(e){e&&e.parentNode&&(e.style.display="none",e.parentNode.removeChild(e))}function a(e,t,n){e instanceof window.HTMLElement&&delete n[t]}var s="#000000";return{embed:o,remove:r}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(48)],o=function(e,t){function n(e){return"jwplayer."+e}function i(){return e.reduce(this.persistItems,function(e,i){var o=c[n(i)];return o&&(e[i]=t.serialize(o)),e},{})}function o(e,t){try{c[n(e)]=t}catch(i){l&&l.debug&&console.error(i)}}function r(){e.each(this.persistItems,function(e){c.removeItem(n(e))})}function a(){}function s(t,n){this.persistItems=t,e.each(this.persistItems,function(e){n.on("change:"+e,function(t,n){o(e,n)})})}var l=window.jwplayer,c={removeItem:t.noop};try{c=window.localStorage}catch(u){}return e.extend(a.prototype,{getAllItems:i,track:s,clear:r}),a}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(61),n(46),n(45)],o=function(e,t,n){function i(e){e.mediaController.off(t.JWPLAYER_MEDIA_PLAY_ATTEMPT,e._onPlayAttempt),e.mediaController.off(t.JWPLAYER_PROVIDER_FIRST_FRAME,e._triggerFirstFrame),e.mediaController.off(t.JWPLAYER_MEDIA_TIME,e._onTime)}function o(e){i(e),e._triggerFirstFrame=n.once(function(){var n=e._qoeItem;n.tick(t.JWPLAYER_MEDIA_FIRST_FRAME);var o=n.between(t.JWPLAYER_MEDIA_PLAY_ATTEMPT,t.JWPLAYER_MEDIA_FIRST_FRAME);e.mediaController.trigger(t.JWPLAYER_MEDIA_FIRST_FRAME,{loadTime:o}),i(e)}),e._onTime=a(e._triggerFirstFrame),e._onPlayAttempt=function(){e._qoeItem.tick(t.JWPLAYER_MEDIA_PLAY_ATTEMPT)},e.mediaController.on(t.JWPLAYER_MEDIA_PLAY_ATTEMPT,e._onPlayAttempt),e.mediaController.once(t.JWPLAYER_PROVIDER_FIRST_FRAME,e._triggerFirstFrame),e.mediaController.on(t.JWPLAYER_MEDIA_TIME,e._onTime)}function r(n){function i(n,i,r){n._qoeItem&&r&&n._qoeItem.end(r.get("state")),n._qoeItem=new e,n._qoeItem.tick(t.JWPLAYER_PLAYLIST_ITEM),n._qoeItem.start(i.get("state")),o(n),i.on("change:state",function(e,t,i){n._qoeItem.end(i),n._qoeItem.start(t)})}n.on("change:mediaModel",i)}var a=function(e){var t=Number.MIN_VALUE;return function(n){n.position>t&&e(),t=n.position}};return{model:r}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(47)],o=function(e,t){var n=e.extend({get:function(e){return this.attributes=this.attributes||{},this.attributes[e]},set:function(e,t){if(this.attributes=this.attributes||{},this.attributes[e]!==t){var n=this.attributes[e];this.attributes[e]=t,this.trigger("change:"+e,this,t,n)}},clone:function(){return e.clone(this.attributes)}},t);return n}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(47),n(77),n(76),n(46),n(62),n(48),n(45)],o=function(e,t,n,i,o,r,a){var s=function(e,i){this.model=i,this._adModel=(new t).setup({id:i.get("id"),volume:i.get("volume"),fullscreen:i.get("fullscreen"),mute:i.get("mute")}),this._adModel.on("change:state",n,this);var o=e.getContainer();this.swf=o.querySelector("object")};return s.prototype=a.extend({init:function(){if(r.isChrome()){var e=-1,t=!1;this.swf.on("throttle",function(n){if(clearTimeout(e),"resume"===n.state)t&&(t=!1,this.instreamPlay());else{var i=this;e=setTimeout(function(){i._adModel.get("state")===o.PLAYING&&(t=!0,i.instreamPause())},250)}},this)}this.swf.on("instream:state",function(e){switch(e.newstate){case o.PLAYING:this._adModel.set("state",e.newstate);break;case o.PAUSED:this._adModel.set("state",e.newstate)}},this).on("instream:time",function(e){this._adModel.set("position",e.position),this._adModel.set("duration",e.duration),this.trigger(i.JWPLAYER_MEDIA_TIME,e)},this).on("instream:complete",function(e){this.trigger(i.JWPLAYER_MEDIA_COMPLETE,e)},this).on("instream:error",function(e){this.trigger(i.JWPLAYER_MEDIA_ERROR,e)},this),this.swf.triggerFlash("instream:init"),this.applyProviderListeners=function(e){this.model.on("change:volume",function(t,n){e.volume(n)},this),this.model.on("change:mute",function(t,n){e.mute(n)},this)}},instreamDestroy:function(){this._adModel&&(this.off(),this.swf.off(null,null,this),this.swf.triggerFlash("instream:destroy"),this.swf=null,this._adModel.off(),this._adModel=null,this.model=null)},load:function(e){this.swf.triggerFlash("instream:load",e)},instreamPlay:function(){this.swf.triggerFlash("instream:play")},instreamPause:function(){this.swf.triggerFlash("instream:pause")}},e),s}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(94),n(47),n(45),n(46)],o=function(e,t,n,i){var o=function(t,o,r,a){function s(){A("Setup Timeout Error","Setup took longer than "+g+" seconds to complete.")}function l(){n.each(f,function(e){e.complete!==!0&&e.running!==!0&&null!==t&&u(e.depends)&&(e.running=!0,c(e))})}function c(e){var n=function(t){t=t||{},d(e,t)};e.method(n,o,t,r,a)}function u(e){return n.all(e,function(e){return f[e].complete})}function d(e,t){"error"===t.type?A(t.msg,t.reason):"complete"===t.type?(clearTimeout(h),p.trigger(i.JWPLAYER_READY)):(e.complete=!0,l())}function A(e,t){clearTimeout(h),p.trigger(i.JWPLAYER_SETUP_ERROR,{message:e+": "+t}),p.destroy()}var h,p=this,f=e.getQueue(),g=30;this.start=function(){h=setTimeout(s,1e3*g),l()},this.destroy=function(){clearTimeout(h),this.off(),f.length=0,t=null,o=null,r=null}};return o.prototype=t,o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(95),n(81),n(80),n(45),n(48),n(57),n(97)],o=function(e,t,i,o,r,a,s){function l(e,t,n){if(t){var i=t.client;delete t.client,/\.(js|swf)$/.test(i||"")||(i=a.repo()+n),e[i]=t}}function c(e,n){var i=o.clone(n.get("plugins"))||{},r=n.get("edition"),s=t(r),c=/^(vast|googima)$/,u=/\.(js|swf)$/,d=a.repo(),A=n.get("advertising");if(A&&(u.test(A.client)?i[A.client]=A:c.test(A.client)&&(i[d+A.client+".js"]=A),delete A.client),s("jwpsrv")){var h=n.get("analytics");o.isObject(h)||(h={}),l(i,h,"jwpsrv.js")}l(i,n.get("ga"),"gapro.js"),l(i,n.get("sharing"),"sharing.js"),l(i,n.get("related"),"related.js"),n.set("plugins",i),e()}function u(t,i){var o=i.get("key")||window.jwplayer&&window.jwplayer.key,l=new e(o),c=l.edition();if(i.set("key",o),i.set("edition",c),"unlimited"===c){var u=r.getScriptPath("jwplayer.js");if(!u)return void s.error(t,"Error setting up player","Could not locate jwplayer.js script tag");n.p=u,r.repo=a.repo=a.loadFrom=function(){return u}}t()}function d(e,t,i){"dashjs"===e?n.e(4,function(e){var o=n(107);o.register(window.jwplayer),i.updateProviders(),t()}):n.e(5,function(e){var o=n(109);o.register(window.jwplayer),i.updateProviders(),t()})}function A(e,t){var n=t.get("playlist"),r=t.get("edition"),a=t.get("dash");o.contains(["shaka","dashjs"],a)||(a="shaka");var s=o.where(i,{name:a})[0].supports,l=o.some(n,function(e){return s(e,r)});l?d(a,e,t):e()}function h(){var e=s.getQueue();return e.LOAD_DASH={method:A,depends:["CHECK_KEY","FILTER_PLAYLIST"]},e.CHECK_KEY={method:u,depends:["LOADED_POLYFILLS"]},e.FILTER_PLUGINS={method:c,depends:["CHECK_KEY"]},e.FILTER_PLAYLIST.depends.push("CHECK_KEY"),e.LOAD_PLUGINS.depends.push("FILTER_PLUGINS"),e.SETUP_VIEW.depends.push("CHECK_KEY"),e.SEND_READY.depends.push("LOAD_DASH"),e}return{getQueue:h}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(96),n(81)],o=function(e,t,n){var i="invalid",o="RnXcsftYjWRDA^Uy",r=function(r){function a(r){e.exists(r)||(r="");try{r=t.decrypt(r,o);var a=r.split("/");s=a[0],"pro"===s&&(s="premium");var u=n(s);if(a.length>2&&u("setup")){l=a[1];var d=parseInt(a[2]);d>0&&(c=new Date,c.setTime(d))}else s=i}catch(A){s=i}}var s,l,c;this.edition=function(){return c&&c.getTime()<(new Date).getTime()?i:s},this.token=function(){return l},this.expiration=function(){return c},a(r)};return r}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){var e=function(e){return window.atob(e)},t=function(e){return unescape(encodeURIComponent(e))},n=function(e){try{return decodeURIComponent(escape(e))}catch(t){return e}},i=function(e){for(var t=new Array(Math.ceil(e.length/4)),n=0;n<t.length;n++)t[n]=e.charCodeAt(4*n)+(e.charCodeAt(4*n+1)<<8)+(e.charCodeAt(4*n+2)<<16)+(e.charCodeAt(4*n+3)<<24);return t},o=function(e){for(var t=new Array(e.length),n=0;n<e.length;n++)t[n]=String.fromCharCode(255&e[n],e[n]>>>8&255,e[n]>>>16&255,e[n]>>>24&255);return t.join("")};return{decrypt:function(r,a){if(r=String(r),a=String(a),0==r.length)return"";for(var s,l,c=i(e(r)),u=i(t(a).slice(0,16)),d=c.length,A=c[d-1],h=c[0],p=2654435769,f=Math.floor(6+52/d),g=f*p;0!=g;){l=g>>>2&3;for(var m=d-1;m>=0;m--)A=c[m>0?m-1:d-1],s=(A>>>5^h<<2)+(h>>>3^A<<4)^(g^h)+(u[3&m^l]^A),h=c[m]-=s;g-=p}var w=o(c);return w=w.replace(/\0+$/,""),n(w)}}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(98),n(65),n(101),n(58),n(45),n(48),n(46)],o=function(e,t,i,o,r,a,s){function l(){var e={LOAD_PROMISE_POLYFILL:{method:c,depends:[]},LOAD_BASE64_POLYFILL:{method:u,depends:[]},LOADED_POLYFILLS:{method:d,depends:["LOAD_PROMISE_POLYFILL","LOAD_BASE64_POLYFILL"]},LOAD_PLUGINS:{method:A,depends:["LOADED_POLYFILLS"]},INIT_PLUGINS:{method:h,depends:["LOAD_PLUGINS","SETUP_VIEW"]},LOAD_YOUTUBE:{method:E,depends:["FILTER_PLAYLIST"]},LOAD_SKIN:{method:y,depends:["LOADED_POLYFILLS"]},LOAD_PLAYLIST:{method:f,depends:["LOADED_POLYFILLS"]},FILTER_PLAYLIST:{method:g,depends:["LOAD_PLAYLIST"]},SETUP_VIEW:{method:j,depends:["LOAD_SKIN"]},SEND_READY:{method:b,depends:["INIT_PLUGINS","LOAD_YOUTUBE","SETUP_VIEW"]}};return e}function c(e){window.Promise?e():n.e(1,function(t){n(104),e()})}function u(e){window.btoa&&window.atob?e():n.e(2,function(t){n(105),e()})}function d(e){e()}function A(t,n){k=e.loadPlugins(n.get("id"),n.get("plugins")),k.on(s.COMPLETE,t),k.on(s.ERROR,r.partial(p,t)),k.load()}function h(e,t,n){k.setupPlugins(n,t),e()}function p(e,t){C(e,"Could not load plugin",t.message)}function f(e,n){var i=n.get("playlist");r.isString(i)?(L=new t,L.on(s.JWPLAYER_PLAYLIST_LOADED,function(t){n.set("playlist",t.playlist),e()}),L.on(s.JWPLAYER_ERROR,r.partial(m,e)),L.load(i)):e()}function g(e,t,n,i,o){var r=t.get("playlist"),a=o(r);a?e():m(e)}function m(e,t){t&&t.message?C(e,"Error loading playlist",t.message):C(e,"Error loading player","No playable sources found")}function w(e,t){return r.contains(o.SkinsLoadable,e)?t+"skins/"+e+".css":void 0}function v(e){for(var t=document.styleSheets,n=0,i=t.length;i>n;n++)if(t[n].href===e)return!0;return!1}function y(e,t){var n=t.get("skin"),a=t.get("skinUrl");if(r.contains(o.SkinsIncluded,n))return void e();if(a||(a=w(n,t.get("base"))),r.isString(a)&&!v(a)){t.set("skin-loading",!0);var l=!0,c=new i(a,l);c.addEventListener(s.COMPLETE,function(){t.set("skin-loading",!1)}),c.addEventListener(s.ERROR,function(){t.set("skin","seven"),t.set("skin-loading",!1)}),c.load()}r.defer(function(){e()})}function E(e,t){var i=t.get("playlist"),o=r.some(i,function(e){var t=a.isYouTube(e.file,e.type);if(t&&!e.image){var n=e.file,i=a.youTubeID(n);e.image="//i.ytimg.com/vi/"+i+"/0.jpg"}return t});o?n.e(3,function(t){var i=n(106);i.register(window.jwplayer),e()}):e()}function j(e,t,n,i){i.setup(),e()}function b(e){e({type:"complete"})}function C(e,t,n){e({type:"error",msg:t,reason:n})}var k,L;return{getQueue:l,error:C}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(99),n(102),n(103),n(100)],o=function(e,t,n,i){var o={},r={},a=function(n,i){return r[n]=new e(new t(o),i),r[n]},s=function(e,t,r,a){var s=i.getPluginName(e);o[s]||(o[s]=new n(e)),o[s].registerPlugin(e,t,r,a)};return{loadPlugins:a,registerPlugin:s}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(100),n(48),n(46),n(47),n(45),n(101)],o=function(e,t,n,i,o,r){function a(e,t,n){return function(){var i=e.getContainer().getElementsByClassName("jw-overlays")[0];i&&(i.appendChild(n),n.left=i.style.left,n.top=i.style.top,t.displayArea=i)}}function s(e){function t(){var t=e.displayArea;t&&e.resize(t.clientWidth,t.clientHeight)}return function(){t(),setTimeout(t,400)}}var l=function(l,c){function u(){g||(g=!0,f=r.loaderstatus.COMPLETE,p.trigger(n.COMPLETE))}function d(){if(!w&&(c&&0!==o.keys(c).length||u(),!g)){var i=l.getPlugins();h=o.after(m,u),o.each(c,function(o,a){var s=e.getPluginName(a),l=i[s],c=l.getJS(),u=l.getTarget(),d=l.getStatus();d!==r.loaderstatus.LOADING&&d!==r.loaderstatus.NEW&&(c&&!t.versionCheck(u)&&p.trigger(n.ERROR,{message:"Incompatible player version"}),h())})}}function A(e){if(!w){var i="File not found";e.url&&t.log(i,e.url),this.off(),this.trigger(n.ERROR,{message:i}),d()}}var h,p=o.extend(this,i),f=r.loaderstatus.NEW,g=!1,m=o.size(c),w=!1;this.setupPlugins=function(n,i){var r=[],c=l.getPlugins(),u=i.get("plugins");o.each(u,function(i,l){var d=e.getPluginName(l),A=c[d],h=A.getFlashPath(),p=A.getJS(),f=A.getURL();if(h){var g=o.extend({name:d,swf:h,pluginmode:A.getPluginmode()},i);r.push(g)}var m=t.tryCatch(function(){if(p&&u[f]){var e=document.createElement("div");e.id=n.id+"_"+d,e.className="jw-plugin jw-reset";var t=o.extend({},u[f]),i=A.getNewInstance(n,t,e);i.addToPlayer=a(n,i,e),i.resizeHandler=s(i),n.addPlugin(d,i,e)}});m instanceof t.Error&&t.log("ERROR: Failed to load "+d+".")}),i.set("flashPlugins",r)},this.load=function(){if(t.exists(c)&&"object"!==t.typeOf(c))return void d();f=r.loaderstatus.LOADING,o.each(c,function(e,i){if(t.exists(i)){var o=l.addPlugin(i);o.on(n.COMPLETE,d),o.on(n.ERROR,A)}});var e=l.getPlugins();o.each(e,function(e){e.load()}),d()},this.destroy=function(){w=!0,this.off()},this.getStatus=function(){return f}};return l}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(51)],o=function(e){
      var t={},n=t.pluginPathType={ABSOLUTE:0,RELATIVE:1,CDN:2};return t.getPluginPathType=function(t){if("string"==typeof t){t=t.split("?")[0];var i=t.indexOf("://");if(i>0)return n.ABSOLUTE;var o=t.indexOf("/"),r=e.extension(t);return!(0>i&&0>o)||r&&isNaN(r)?n.RELATIVE:n.CDN}},t.getPluginName=function(e){return e.replace(/^(.*\/)?([^-]*)-?.*\.(swf|js)$/,"$2")},t.getPluginVersion=function(e){return e.replace(/[^-]*-?([^\.]*).*$/,"$1")},t}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(46),n(47),n(45)],o=function(e,t,n){var i={},o={NEW:0,LOADING:1,ERROR:2,COMPLETE:3},r=function(r,a){function s(t){u=o.ERROR,c.trigger(e.ERROR,t)}function l(t){u=o.COMPLETE,c.trigger(e.COMPLETE,t)}var c=n.extend(this,t),u=o.NEW;this.addEventListener=this.on,this.removeEventListener=this.off,this.makeStyleLink=function(e){var t=document.createElement("link");return t.type="text/css",t.rel="stylesheet",t.href=e,t},this.makeScriptTag=function(e){var t=document.createElement("script");return t.src=e,t},this.makeTag=a?this.makeStyleLink:this.makeScriptTag,this.load=function(){if(u===o.NEW){var t=i[r];if(t&&(u=t.getStatus(),2>u))return t.on(e.ERROR,s),void t.on(e.COMPLETE,l);var n=document.getElementsByTagName("head")[0]||document.documentElement,c=this.makeTag(r),d=!1;c.onload=c.onreadystatechange=function(e){d||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState||(d=!0,l(e),c.onload=c.onreadystatechange=null,n&&c.parentNode&&!a&&n.removeChild(c))},c.onerror=s,n.insertBefore(c,n.firstChild),u=o.LOADING,i[r]=this}},this.getStatus=function(){return u}};return r.loaderstatus=o,r}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(100),n(103)],o=function(e,t){var n=function(n){this.addPlugin=function(i){var o=e.getPluginName(i);return n[o]||(n[o]=new t(i)),n[o]},this.getPlugins=function(){return n}};return n}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(100),n(46),n(47),n(101),n(45)],o=function(e,t,n,i,o,r){var a={FLASH:0,JAVASCRIPT:1,HYBRID:2},s=function(s){function l(){switch(t.getPluginPathType(s)){case t.pluginPathType.ABSOLUTE:return s;case t.pluginPathType.RELATIVE:return e.getAbsolutePath(s,window.location.href)}}function c(){r.defer(function(){g=o.loaderstatus.COMPLETE,f.trigger(n.COMPLETE)})}function u(){g=o.loaderstatus.ERROR,f.trigger(n.ERROR,{url:s})}var d,A,h,p,f=r.extend(this,i),g=o.loaderstatus.NEW;this.load=function(){if(g===o.loaderstatus.NEW){if(s.lastIndexOf(".swf")>0)return d=s,g=o.loaderstatus.COMPLETE,void f.trigger(n.COMPLETE);if(t.getPluginPathType(s)===t.pluginPathType.CDN)return g=o.loaderstatus.COMPLETE,void f.trigger(n.COMPLETE);g=o.loaderstatus.LOADING;var e=new o(l());e.on(n.COMPLETE,c),e.on(n.ERROR,u),e.load()}},this.registerPlugin=function(e,t,i,r){p&&(clearTimeout(p),p=void 0),h=t,i&&r?(d=r,A=i):"string"==typeof i?d=i:"function"==typeof i?A=i:i||r||(d=e),g=o.loaderstatus.COMPLETE,f.trigger(n.COMPLETE)},this.getStatus=function(){return g},this.getPluginName=function(){return t.getPluginName(s)},this.getFlashPath=function(){if(d)switch(t.getPluginPathType(d)){case t.pluginPathType.ABSOLUTE:return d;case t.pluginPathType.RELATIVE:return s.lastIndexOf(".swf")>0?e.getAbsolutePath(d,window.location.href):e.getAbsolutePath(d,l())}return null},this.getJS=function(){return A},this.getTarget=function(){return h},this.getPluginmode=function(){return void 0!==typeof d&&void 0!==typeof A?a.HYBRID:void 0!==typeof d?a.FLASH:void 0!==typeof A?a.JAVASCRIPT:void 0},this.getNewInstance=function(e,t,n){return new A(e,t,n)},this.getURL=function(){return s}};return s}.apply(t,i),!(void 0!==o&&(e.exports=o))},,,,,,,,function(e,t,n){var i,o;i=[n(66),n(112),n(113),n(48)],o=function(e,t,n,i){var o=function(o,r){function a(e){if(e.tracks.length){r.mediaController.off("meta",s),w=[],v={},y={},E=0;for(var t=e.tracks||[],n=0;n<t.length;n++){var i=t[n];i.id=i.name,i.label=i.name||i.language,d(i)}var o=p();this.setCaptionsList(o),f()}}function s(e){var t=e.metadata;if(t&&"textdata"===t.type){if(!t.text)return;var n=v[t.trackid];if(!n){n={kind:"captions",id:t.trackid,data:[]},d(n);var i=p();this.setCaptionsList(i)}var o,a;t.useDTS?(n.source||(n.source=t.source||"mpegts"),o=t.begin,a=t.begin+"_"+t.text):(o=e.position||r.get("position"),a=""+Math.round(10*o)+"_"+t.text);var s=y[a];s||(s={begin:o,text:t.text},t.end&&(s.end=t.end),y[a]=s,n.data.push(s))}}function l(e){i.log("CAPTIONS("+e+")")}function c(e,t){m=t,w=[],v={},y={},E=0,r.mediaController.off("meta",s),r.mediaController.off("subtitlesTracks",a);var n,o,l,c=t.tracks;for(l=0;l<c.length;l++)if(n=c[l],o=n.kind.toLowerCase(),"captions"===o||"subtitles"===o)if(n.file){var u=i.isIOS()&&!i.isSDK(r.getConfiguration())&&-1!==n.file.indexOf(".vtt");u||(d(n),A(n))}else n.data&&d(n);0===w.length&&(r.mediaController.on("meta",s,this),r.mediaController.on("subtitlesTracks",a,this));var h=p();this.setCaptionsList(h),f()}function u(e,t){var n=null;0!==t&&(n=w[t-1]),e.set("captionsTrack",n)}function d(e){"number"!=typeof e.id&&(e.id=e.name||e.file||"cc"+w.length),e.data=e.data||[],e.label||(e.label="Unknown CC",E++,E>1&&(e.label+=" ("+E+")")),w.push(e),v[e.id]=e}function A(e){i.ajax(e.file,function(t){h(t,e)},l)}function h(o,r){var a,s=o.responseXML?o.responseXML.firstChild:null;if(s)for("xml"===e.localName(s)&&(s=s.nextSibling);s.nodeType===s.COMMENT_NODE;)s=s.nextSibling;a=s&&"tt"===e.localName(s)?i.tryCatch(function(){r.data=n(o.responseXML)}):i.tryCatch(function(){r.data=t(o.responseText)}),a instanceof i.Error&&l(a.message+": "+r.file)}function p(){for(var e=[{id:"off",label:"Off"}],t=0;t<w.length;t++)e.push({id:w[t].id,label:w[t].label||"Unknown CC"});return e}function f(){var e=0,t=r.get("captionLabel");if("Off"===t)return void r.set("captionsIndex",0);for(var n=0;n<w.length;n++){var i=w[n];if(t&&t===i.label){e=n+1;break}i["default"]||i.defaulttrack?e=n+1:i.autoselect}g(e)}function g(e){w.length?r.setVideoSubtitleTrack(e,w):r.set("captionsIndex",e)}r.on("change:playlistItem",c,this),r.on("change:captionsIndex",u,this),r.mediaController.on("subtitlesTracks",a,this),r.mediaController.on("subtitlesTrackData",function(e){var t=v[e.name];if(t){t.source=e.source;for(var n=e.captions||[],i=!1,o=0;o<n.length;o++){var r=n[o],a=e.name+"_"+r.begin+"_"+r.end;y[a]||(y[a]=r,t.data.push(r),i=!0)}i&&t.data.sort(function(e,t){return e.begin-t.begin})}},this),r.mediaController.on("meta",s,this);var m={},w=[],v={},y={},E=0;this.getCurrentIndex=function(){return r.get("captionsIndex")},this.getCaptionsList=function(){return r.get("captionsList")},this.setCaptionsList=function(e){r.set("captionsList",e)}};return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(51)],o=function(e,t){function n(e){var t={},n=e.split("\r\n");1===n.length&&(n=e.split("\n"));var o=1;if(n[0].indexOf(" --> ")>0&&(o=0),n.length>o+1&&n[o+1]){var r=n[o],a=r.indexOf(" --> ");a>0&&(t.begin=i(r.substr(0,a)),t.end=i(r.substr(a+5)),t.text=n.slice(o+1).join("<br/>"))}return t}var i=e.seconds;return function(e){var i=[];e=t.trim(e);var o=e.split("\r\n\r\n");1===o.length&&(o=e.split("\n\n"));for(var r=0;r<o.length;r++)if("WEBVTT"!==o[r]){var a=n(o[r]);a.text&&i.push(a)}if(!i.length)throw new Error("Invalid SRT file");return i}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(51)],o=function(e){function t(e){e||n()}function n(){throw new Error("Invalid DFXP file")}var i=e.seconds;return function(o){t(o);var r=[],a=o.getElementsByTagName("p");t(a),a.length||(a=o.getElementsByTagName("tt:p"),a.length||(a=o.getElementsByTagName("tts:p")));for(var s=0;s<a.length;s++){var l=a[s],c=l.innerHTML||l.textContent||l.text||"",u=e.trim(c).replace(/>\s+</g,"><").replace(/tts?:/g,"");if(u){var d=l.getAttribute("begin"),A=l.getAttribute("dur"),h=l.getAttribute("end"),p={begin:i(d),text:u};h?p.end=i(h):A&&(p.end=p.begin+i(A)),r.push(p)}}return r.length||n(),r}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(70),n(71),n(45),n(78)],o=function(e,t,n,i){function o(e,t){for(var n=0;n<e.length;n++){var i=e[n],o=t.choose(i);if(o)return i.type}return null}var r=function(t){return t=n.isArray(t)?t:[t],n.compact(n.map(t,e))};r.filterPlaylist=function(e,t,i,o,r){var l=[];return n.each(e,function(e){e=n.extend({},e),e.allSources=a(e.sources,i,e.drm||o,e.preload||r),e.sources=s(e.allSources,t),e.sources.length&&(e.file=e.sources[0].file,(e.preload||r)&&(e.preload=e.preload||r),l.push(e))}),l};var a=function(e,i,o,r){return n.compact(n.map(e,function(e){return n.isObject(e)?(void 0!==i&&null!==i&&(e.androidhls=i),(e.drm||o)&&(e.drm=e.drm||o),(e.preload||r)&&(e.preload=e.preload||r),t(e)):void 0}))},s=function(e,t){t&&t.choose||(t=new i({primary:t?"flash":null}));var r=o(e,t);return n.where(e,{type:r})};return r}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[],o=function(){return function(e,t){e.getPlaylistIndex=e.getItem;var n={jwPlay:t.play,jwPause:t.pause,jwSetMute:t.setMute,jwLoad:t.load,jwPlaylistItem:t.item,jwGetAudioTracks:t.getAudioTracks,jwDetachMedia:t.detachMedia,jwAttachMedia:t.attachMedia,jwAddEventListener:t.on,jwRemoveEventListener:t.off,jwStop:t.stop,jwSeek:t.seek,jwSetVolume:t.setVolume,jwPlaylistNext:t.next,jwPlaylistPrev:t.prev,jwSetFullscreen:t.setFullscreen,jwGetQualityLevels:t.getQualityLevels,jwGetCurrentQuality:t.getCurrentQuality,jwSetCurrentQuality:t.setCurrentQuality,jwSetCurrentAudioTrack:t.setCurrentAudioTrack,jwGetCurrentAudioTrack:t.getCurrentAudioTrack,jwGetCaptionsList:t.getCaptionsList,jwGetCurrentCaptions:t.getCurrentCaptions,jwSetCurrentCaptions:t.setCurrentCaptions,jwSetCues:t.setCues};e.callInternal=function(e){console.log("You are using the deprecated callInternal method for "+e);var i=Array.prototype.slice.call(arguments,1);n[e].apply(t,i)}}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(117),n(46),n(154)],o=function(e,t,n){var i=function(i,o){var r=new e(i,o),a=r.setup;return r.setup=function(){if(a.call(this),"trial"===o.get("edition")){var e=document.createElement("div");e.className="jw-icon jw-watermark",this.element().appendChild(e)}o.on("change:skipButton",this.onSkipButton,this),o.on("change:castActive change:playlistItem",this.showDisplayIconImage,this)},r.showDisplayIconImage=function(e){var t=e.get("castActive"),n=e.get("playlistItem"),i=r.controlsContainer().getElementsByClassName("jw-display-icon-container")[0];t&&n&&n.image?(i.style.backgroundImage='url("'+n.image+'")',i.style.backgroundSize="contain"):(i.style.backgroundImage="",i.style.backgroundSize="")},r.onSkipButton=function(e,t){t?this.addSkipButton():this._skipButton&&(this._skipButton.destroy(),this._skipButton=null)},r.addSkipButton=function(){this._skipButton=new n(this.instreamModel),this._skipButton.on(t.JWPLAYER_AD_SKIPPED,function(){this.api.skipAd()},this),this.controlsContainer().appendChild(this._skipButton.element())},r};return i}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(46),n(47),n(58),n(62),n(128),n(129),n(130),n(118),n(132),n(134),n(148),n(149),n(152),n(45),n(153)],o=function(e,t,n,i,o,r,a,s,l,c,u,d,A,h,p,f){var g=e.style,m=e.bounds,w=e.isMobile(),v=["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"],y=function(y,E){function j(t){var n=0,o=E.get("duration"),r=E.get("position");"DVR"===e.adaptiveType(o)&&(n=o,o=Math.max(r,i.dvrSeekLimit));var a=e.between(r+t,n,o);y.seek(a)}function b(t){var n=e.between(E.get("volume")+t,0,100);y.setVolume(n)}function C(e){return e.ctrlKey||e.metaKey?!1:!!E.get("controls")}function k(e){if(!C(e))return!0;switch(Te||ee(),e.keyCode){case 27:y.setFullscreen(!1);break;case 13:case 32:y.play({reason:"interaction"});break;case 37:Te||j(-5);break;case 39:Te||j(5);break;case 38:b(10);break;case 40:b(-10);break;case 77:y.setMute();break;case 70:y.setFullscreen();break;default:if(e.keyCode>=48&&e.keyCode<=59){var t=e.keyCode-48,n=t/10*E.get("duration");y.seek(n)}}return/13|32|37|38|39|40/.test(e.keyCode)?(e.preventDefault(),!1):void 0}function L(){Fe=!1,e.removeClass(ce,"jw-no-focus")}function I(){Fe=!0,e.addClass(ce,"jw-no-focus")}function x(){Fe||L(),Te||ee()}function R(){var e=m(ce),n=Math.round(e.width),i=Math.round(e.height);return document.body.contains(ce)?n&&i&&(n===Ae&&i===he||(Ae=n,he=i,clearTimeout(_e),_e=setTimeout(K,50),E.set("containerWidth",n),E.set("containerHeight",i),Qe.trigger(t.JWPLAYER_RESIZE,{width:n,height:i}))):(window.removeEventListener("resize",R),w&&window.removeEventListener("orientationchange",R)),e}function B(t,n){n=n||!1,e.toggleClass(ce,"jw-flag-casting",n)}function M(t,n){e.toggleClass(ce,"jw-flag-cast-available",n),e.toggleClass(ue,"jw-flag-cast-available",n)}function T(t,n){e.replaceClass(ce,/jw-stretch-\S+/,"jw-stretch-"+n)}function P(t,n){e.toggleClass(ce,"jw-flag-compact-player",n)}function _(e){e&&!w&&(e.element().addEventListener("mousemove",F,!1),e.element().addEventListener("mouseout",Q,!1))}function D(){E.get("state")!==o.IDLE&&E.get("state")!==o.COMPLETE&&E.get("state")!==o.PAUSED||!E.get("controls")||y.play({reason:"interaction"}),Pe?$():ee()}function S(e){e.link?(y.pause(!0),y.setFullscreen(!1),window.open(e.link,e.linktarget)):E.get("controls")&&y.play({reason:"interaction"})}function F(){clearTimeout(Re)}function Q(){ee()}function Y(e){Qe.trigger(e.type,e)}function O(t,n){n?(Ce&&Ce.destroy(),e.addClass(ce,"jw-flag-flash-blocked")):(Ce&&Ce.setup(E,ce,ce),e.removeClass(ce,"jw-flag-flash-blocked"))}function N(){E.get("controls")&&y.setFullscreen()}function J(){var n=ce.getElementsByClassName("jw-overlays")[0];n.addEventListener("mousemove",ee),me=new a(E,de,{useHover:!0}),me.on("click",function(){Y({type:t.JWPLAYER_DISPLAY_CLICK}),E.get("controls")&&y.play({reason:"interaction"})}),me.on("tap",function(){Y({type:t.JWPLAYER_DISPLAY_CLICK}),D()}),me.on("doubleClick",N),me.on("move",ee),me.on("over",ee);var i=new s(E);i.on("click",function(){Y({type:t.JWPLAYER_DISPLAY_CLICK}),y.play({reason:"interaction"})}),i.on("tap",function(){Y({type:t.JWPLAYER_DISPLAY_CLICK}),D()}),e.isChrome()&&i.el.addEventListener("mousedown",function(){var e=E.getVideo(),t=e&&0===e.getName().name.indexOf("flash");if(t){var n=function(){document.removeEventListener("mouseup",n),i.el.style.pointerEvents="auto"};this.style.pointerEvents="none",document.addEventListener("mouseup",n)}}),ue.appendChild(i.element()),ve=new l(E),ye=new c(E),ye.on(t.JWPLAYER_LOGO_CLICK,S);var o=document.createElement("div");o.className="jw-controls-right jw-reset",ye.setup(o),o.appendChild(ve.element()),ue.appendChild(o),je=new r(E),je.setup(E.get("captions")),ue.parentNode.insertBefore(je.element(),Ee.element());var d=E.get("height");w&&("string"==typeof d||d>=1.5*Me)?e.addClass(ce,"jw-flag-touch"):(Ce=new A,Ce.setup(E,ce,ce)),fe=new u(y,E),fe.on(t.JWPLAYER_USER_ACTION,ee),E.on("change:scrubbing",W),E.on("change:compactUI",P),ue.appendChild(fe.element()),ce.addEventListener("focus",x),ce.addEventListener("blur",L),ce.addEventListener("keydown",k),ce.onmousedown=I}function U(t){return t.get("state")===o.PAUSED?void t.once("change:state",U):void(t.get("scrubbing")===!1&&e.removeClass(ce,"jw-flag-dragging"))}function W(t,n){t.off("change:state",U),n?e.addClass(ce,"jw-flag-dragging"):U(t)}function H(t,n,i){var o,r=ce.className;i=!!i,i&&(r=r.replace(/\s*aspectMode/,""),ce.className!==r&&(ce.className=r),g(ce,{display:"block"},i)),e.exists(t)&&e.exists(n)&&(E.set("width",t),E.set("height",n)),o={width:t},e.hasClass(ce,"jw-flag-aspect-mode")||(o.height=n),g(ce,o,!0),G(n),K(t,n)}function G(t){if(be=V(t),fe&&!be){var n=Te?pe:E;le(n,n.get("state"))}e.toggleClass(ce,"jw-flag-audio-player",be)}function V(e){if(E.get("aspectratio"))return!1;if(p.isString(e)&&e.indexOf("%")>-1)return!1;var t=p.isNumber(e)?e:E.get("containerHeight");return z(t)}function z(e){return e&&Me*(w?1.75:1)>=e}function K(t,n){if(!t||isNaN(Number(t))){if(!de)return;t=de.clientWidth}if(!n||isNaN(Number(n))){if(!de)return;n=de.clientHeight}e.isMSIE(9)&&document.all&&!window.atob&&(t=n="100%");var i=E.getVideo();if(i){var o=i.resize(t,n,E.get("stretching"));o&&(clearTimeout(_e),_e=setTimeout(K,250)),je.resize(),fe.checkCompactMode(t)}}function X(){if(Se){var e=document.fullscreenElement||document.webkitCurrentFullScreenElement||document.mozFullScreenElement||document.msFullscreenElement;return!(!e||e.id!==E.get("id"))}return Te?pe.getVideo().getFullScreen():E.getVideo().getFullScreen()}function q(e){var t=E.get("fullscreen"),n=void 0!==e.jwstate?e.jwstate:X();t!==n&&E.set("fullscreen",n),clearTimeout(_e),_e=setTimeout(K,200)}function Z(t,n){n?(e.addClass(t,"jw-flag-fullscreen"),g(document.body,{"overflow-y":"hidden"}),ee()):(e.removeClass(t,"jw-flag-fullscreen"),g(document.body,{"overflow-y":""})),K()}function $(){Pe=!1,clearTimeout(Re),fe.hideComponents(),e.addClass(ce,"jw-flag-user-inactive")}function ee(){Pe||(e.removeClass(ce,"jw-flag-user-inactive"),fe.checkCompactMode(de.clientWidth)),Pe=!0,clearTimeout(Re),Re=setTimeout($,Be)}function te(){y.setFullscreen(!1)}function ne(){we&&we.setState(E.get("state")),ie(E,E.mediaModel.get("mediaType")),E.mediaModel.on("change:mediaType",ie,this)}function ie(t,n){var i="audio"===n;e.toggleClass(ce,"jw-flag-media-audio",i)}function oe(t,n){var i="LIVE"===e.adaptiveType(n);e.toggleClass(ce,"jw-flag-live",i),Qe.setAltText(i?"Live Broadcast":"")}function re(e,t){return t?void(t.name?Ee.updateText(t.name,t.message):Ee.updateText(t.message,"")):void Ee.playlistItem(e,e.get("playlistItem"))}function ae(){var e=E.getVideo();return e?e.isCaster:!1}function se(){e.replaceClass(ce,/jw-state-\S+/,"jw-state-"+ke)}function le(t,n){if(ke=n,clearTimeout(De),n===o.COMPLETE||n===o.IDLE?De=setTimeout(se,100):se(),ae())return void e.addClass(de,"jw-media-show");switch(n){case o.PLAYING:K();break;case o.PAUSED:ee()}}var ce,ue,de,Ae,he,pe,fe,ge,me,we,ve,ye,Ee,je,be,Ce,ke,Le,Ie,xe,Re=-1,Be=w?4e3:2e3,Me=40,Te=!1,Pe=!1,_e=-1,De=-1,Se=!1,Fe=!1,Qe=p.extend(this,n);this.model=E,this.api=y,ce=e.createElement(f({id:E.get("id")})),e.isIE()&&e.addClass(ce,"jw-ie");var Ye=E.get("width"),Oe=E.get("height");g(ce,{width:Ye.toString().indexOf("%")>0?Ye:Ye+"px",height:Oe.toString().indexOf("%")>0?Oe:Oe+"px"}),Ie=ce.requestFullscreen||ce.webkitRequestFullscreen||ce.webkitRequestFullScreen||ce.mozRequestFullScreen||ce.msRequestFullscreen,xe=document.exitFullscreen||document.webkitExitFullscreen||document.webkitCancelFullScreen||document.mozCancelFullScreen||document.msExitFullscreen,Se=Ie&&xe,this.onChangeSkin=function(t,n){e.replaceClass(ce,/jw-skin-\S+/,n?"jw-skin-"+n:"")},this.handleColorOverrides=function(){function t(t,i,o){if(o){t=e.prefix(t,"#"+n+" ");var r={};r[i]=o,e.css(t.join(", "),r)}}var n=E.get("id"),i=E.get("skinColorActive"),o=E.get("skinColorInactive"),r=E.get("skinColorBackground");t([".jw-toggle",".jw-button-color:hover"],"color",i),t([".jw-active-option",".jw-progress",".jw-playlist-container .jw-option.jw-active-option",".jw-playlist-container .jw-option:hover"],"background",i),t([".jw-text",".jw-option",".jw-button-color",".jw-toggle.jw-off",".jw-tooltip-title",".jw-skip .jw-skip-icon",".jw-playlist-container .jw-icon"],"color",o),t([".jw-cue",".jw-knob"],"background",o),t([".jw-playlist-container .jw-option"],"border-bottom-color",o),t([".jw-background-color",".jw-tooltip-title",".jw-playlist",".jw-playlist-container .jw-option"],"background",r),t([".jw-playlist-container ::-webkit-scrollbar"],"border-color",r)},this.setup=function(){this.handleColorOverrides(),E.get("skin-loading")===!0&&(e.addClass(ce,"jw-flag-skin-loading"),E.once("change:skin-loading",function(){e.removeClass(ce,"jw-flag-skin-loading")})),this.onChangeSkin(E,E.get("skin"),""),E.on("change:skin",this.onChangeSkin,this),de=ce.getElementsByClassName("jw-media")[0],ue=ce.getElementsByClassName("jw-controls")[0];var n=ce.getElementsByClassName("jw-preview")[0];ge=new d(E),ge.setup(n);var i=ce.getElementsByClassName("jw-title")[0];Ee=new h(E),Ee.setup(i),J(),ee(),E.set("mediaContainer",de),E.mediaController.on("fullscreenchange",q);for(var r=v.length;r--;)document.addEventListener(v[r],q,!1);window.removeEventListener("resize",R),window.addEventListener("resize",R,!1),w&&(window.removeEventListener("orientationchange",R),window.addEventListener("orientationchange",R,!1)),E.on("change:errorEvent",re),E.on("change:controls",Ne),Ne(E,E.get("controls")),E.on("change:state",le),E.on("change:duration",oe,this),E.on("change:flashBlocked",O),O(E,E.get("flashBlocked")),y.onPlaylistComplete(te),y.onPlaylistItem(ne),E.on("change:castAvailable",M),M(E,E.get("castAvailable")),E.on("change:castActive",B),B(E,E.get("castActive")),E.get("stretching")&&T(E,E.get("stretching")),E.on("change:stretching",T),le(E,o.IDLE),E.on("change:fullscreen",Je),_(fe),_(ye);var a=E.get("aspectratio");if(a){e.addClass(ce,"jw-flag-aspect-mode");var s=ce.getElementsByClassName("jw-aspect")[0];g(s,{paddingTop:a})}y.on(t.JWPLAYER_READY,function(){R(),H(E.get("width"),E.get("height"))})};var Ne=function(t,n){if(n){var i=Te?pe.get("state"):E.get("state");le(t,i)}e.toggleClass(ce,"jw-flag-controls-disabled",!n)},Je=function(t,n){var i=E.getVideo();Se?(n?Ie.apply(ce):xe.apply(document),Z(ce,n)):e.isIE()?Z(ce,n):(pe&&pe.getVideo()&&pe.getVideo().setFullscreen(n),i.setFullscreen(n)),i&&0===i.getName().name.indexOf("flash")&&i.setFullscreen(n)};this.resize=function(e,t){var n=!0;H(e,t,n),R()},this.resizeMedia=K,this.reset=function(){document.contains(ce)&&ce.parentNode.replaceChild(Le,ce),e.emptyElement(ce)},this.setupInstream=function(t){this.instreamModel=pe=t,pe.on("change:controls",Ne,this),pe.on("change:state",le,this),Te=!0,e.addClass(ce,"jw-flag-ads"),ee()},this.setAltText=function(e){fe.setAltText(e)},this.useExternalControls=function(){e.addClass(ce,"jw-flag-ads-hide-controls")},this.destroyInstream=function(){if(Te=!1,pe&&(pe.off(null,null,this),pe=null),this.setAltText(""),e.removeClass(ce,"jw-flag-ads"),e.removeClass(ce,"jw-flag-ads-hide-controls"),E.getVideo){var t=E.getVideo();t.setContainer(de)}oe(E,E.get("duration")),me.revertAlternateClickHandlers()},this.addCues=function(e){fe&&fe.addCues(e)},this.clickHandler=function(){return me},this.controlsContainer=function(){return ue},this.getContainer=this.element=function(){return ce},this.getSafeRegion=function(t){var n={x:0,y:0,width:E.get("containerWidth")||0,height:E.get("containerHeight")||0},i=E.get("dock");return i&&i.length&&E.get("controls")&&(n.y=ve.element().clientHeight,n.height-=n.y),t=t||!e.exists(t),t&&E.get("controls")&&(n.height-=fe.element().clientHeight),n},this.destroy=function(){window.removeEventListener("resize",R),window.removeEventListener("orientationchange",R);for(var t=v.length;t--;)document.removeEventListener(v[t],q,!1);E.mediaController&&E.mediaController.off("fullscreenchange",q),ce.removeEventListener("keydown",k,!1),Ce&&Ce.destroy(),we&&(E.off("change:state",we.statusDelegate),we.destroy(),we=null),Te&&this.destroyInstream(),ye&&ye.destroy(),e.clearCss("#"+E.get("id"))}};return y}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(119),n(48),n(45),n(127)],o=function(e,t,n,i){var o=function(e){this.model=e,this.setup(),this.model.on("change:dock",this.render,this)};return n.extend(o.prototype,{setup:function(){var n=this.model.get("dock"),o=this.click.bind(this),r=e(n);this.el=t.createElement(r),new i(this.el).on("click tap",o)},getDockButton:function(e){return t.hasClass(e.target,"jw-dock-button")?e.target:t.hasClass(e.target,"jw-dock-text")?e.target.parentElement.parentElement:e.target.parentElement},click:function(e){var t=this.getDockButton(e),i=t.getAttribute("button"),o=this.model.get("dock"),r=n.findWhere(o,{id:i});r&&r.callback&&r.callback(e)},render:function(){var n=this.model.get("dock"),i=e(n),o=t.createElement(i);this.el.innerHTML=o.innerHTML},element:function(){return this.el}}),o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({1:function(e,t,n,i){var o,r,a="function",s=t.helperMissing,l=this.escapeExpression,c='    <div class="jw-dock-button jw-background-color jw-reset';return o=t["if"].call(e,null!=e?e.btnClass:e,{name:"if",hash:{},fn:this.program(2,i),inverse:this.noop,data:i}),null!=o&&(c+=o),c+='" button="'+l((r=null!=(r=t.id||(null!=e?e.id:e))?r:s,typeof r===a?r.call(e,{name:"id",hash:{},data:i}):r))+'">\n        <div class="jw-icon jw-dock-image jw-reset" ',o=t["if"].call(e,null!=e?e.img:e,{name:"if",hash:{},fn:this.program(4,i),inverse:this.noop,data:i}),null!=o&&(c+=o),c+='></div>\n        <div class="jw-arrow jw-reset"></div>\n',o=t["if"].call(e,null!=e?e.tooltip:e,{name:"if",hash:{},fn:this.program(6,i),inverse:this.noop,data:i}),null!=o&&(c+=o),c+"    </div>\n"},2:function(e,t,n,i){var o,r="function",a=t.helperMissing,s=this.escapeExpression;return" "+s((o=null!=(o=t.btnClass||(null!=e?e.btnClass:e))?o:a,typeof o===r?o.call(e,{name:"btnClass",hash:{},data:i}):o))},4:function(e,t,n,i){var o,r="function",a=t.helperMissing,s=this.escapeExpression;return"style='background-image: url(\""+s((o=null!=(o=t.img||(null!=e?e.img:e))?o:a,typeof o===r?o.call(e,{name:"img",hash:{},data:i}):o))+"\")'"},6:function(e,t,n,i){var o,r="function",a=t.helperMissing,s=this.escapeExpression;return'        <div class="jw-overlay jw-background-color jw-reset">\n            <span class="jw-text jw-dock-text jw-reset">'+s((o=null!=(o=t.tooltip||(null!=e?e.tooltip:e))?o:a,typeof o===r?o.call(e,{name:"tooltip",hash:{},data:i}):o))+"</span>\n        </div>\n"},compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){var o,r='<div class="jw-dock jw-reset">\n';return o=t.each.call(e,e,{name:"each",hash:{},fn:this.program(1,i),inverse:this.noop,data:i}),null!=o&&(r+=o),r+"</div>"},useData:!0})},function(e,t,n){e.exports=n(121)},function(e,t,n){"use strict";var i=n(122),o=n(124)["default"],r=n(125)["default"],a=n(123),s=n(126),l=function(){var e=new i.HandlebarsEnvironment;return a.extend(e,i),e.SafeString=o,e.Exception=r,e.Utils=a,e.escapeExpression=a.escapeExpression,e.VM=s,e.template=function(t){return s.template(t,e)},e},c=l();c.create=l,c["default"]=c,t["default"]=c},function(e,t,n){"use strict";function i(e,t){this.helpers=e||{},this.partials=t||{},o(this)}function o(e){e.registerHelper("helperMissing",function(){if(1!==arguments.length)throw new a("Missing helper: '"+arguments[arguments.length-1].name+"'")}),e.registerHelper("blockHelperMissing",function(t,n){var i=n.inverse,o=n.fn;if(t===!0)return o(this);if(t===!1||null==t)return i(this);if(u(t))return t.length>0?(n.ids&&(n.ids=[n.name]),e.helpers.each(t,n)):i(this);if(n.data&&n.ids){var a=g(n.data);a.contextPath=r.appendContextPath(n.data.contextPath,n.name),n={data:a}}return o(t,n)}),e.registerHelper("each",function(e,t){if(!t)throw new a("Must pass iterator to #each");var n,i,o=t.fn,s=t.inverse,l=0,c="";if(t.data&&t.ids&&(i=r.appendContextPath(t.data.contextPath,t.ids[0])+"."),d(e)&&(e=e.call(this)),t.data&&(n=g(t.data)),e&&"object"==typeof e)if(u(e))for(var A=e.length;A>l;l++)n&&(n.index=l,n.first=0===l,n.last=l===e.length-1,i&&(n.contextPath=i+l)),c+=o(e[l],{data:n});else for(var h in e)e.hasOwnProperty(h)&&(n&&(n.key=h,n.index=l,n.first=0===l,i&&(n.contextPath=i+h)),c+=o(e[h],{data:n}),l++);return 0===l&&(c=s(this)),c}),e.registerHelper("if",function(e,t){return d(e)&&(e=e.call(this)),!t.hash.includeZero&&!e||r.isEmpty(e)?t.inverse(this):t.fn(this)}),e.registerHelper("unless",function(t,n){return e.helpers["if"].call(this,t,{fn:n.inverse,inverse:n.fn,hash:n.hash})}),e.registerHelper("with",function(e,t){d(e)&&(e=e.call(this));var n=t.fn;if(r.isEmpty(e))return t.inverse(this);if(t.data&&t.ids){var i=g(t.data);i.contextPath=r.appendContextPath(t.data.contextPath,t.ids[0]),t={data:i}}return n(e,t)}),e.registerHelper("log",function(t,n){var i=n.data&&null!=n.data.level?parseInt(n.data.level,10):1;e.log(i,t)}),e.registerHelper("lookup",function(e,t){return e&&e[t]})}var r=n(123),a=n(125)["default"],s="2.0.0";t.VERSION=s;var l=6;t.COMPILER_REVISION=l;var c={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:"== 1.x.x",5:"== 2.0.0-alpha.x",6:">= 2.0.0-beta.1"};t.REVISION_CHANGES=c;var u=r.isArray,d=r.isFunction,A=r.toString,h="[object Object]";t.HandlebarsEnvironment=i,i.prototype={constructor:i,logger:p,log:f,registerHelper:function(e,t){if(A.call(e)===h){if(t)throw new a("Arg not supported with multiple helpers");r.extend(this.helpers,e)}else this.helpers[e]=t},unregisterHelper:function(e){delete this.helpers[e]},registerPartial:function(e,t){A.call(e)===h?r.extend(this.partials,e):this.partials[e]=t},unregisterPartial:function(e){delete this.partials[e]}};var p={methodMap:{0:"debug",1:"info",2:"warn",3:"error"},DEBUG:0,INFO:1,WARN:2,ERROR:3,level:3,log:function(e,t){if(p.level<=e){var n=p.methodMap[e];"undefined"!=typeof console&&console[n]&&console[n].call(console,t)}}};t.logger=p;var f=p.log;t.log=f;var g=function(e){var t=r.extend({},e);return t._parent=e,t};t.createFrame=g},function(e,t,n){"use strict";function i(e){return c[e]}function o(e){for(var t=1;t<arguments.length;t++)for(var n in arguments[t])Object.prototype.hasOwnProperty.call(arguments[t],n)&&(e[n]=arguments[t][n]);return e}function r(e){return e instanceof l?e.toString():null==e?"":e?(e=""+e,d.test(e)?e.replace(u,i):e):e+""}function a(e){return e||0===e?!(!p(e)||0!==e.length):!0}function s(e,t){return(e?e+".":"")+t}var l=n(124)["default"],c={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},u=/[&<>"'`]/g,d=/[&<>"'`]/;t.extend=o;var A=Object.prototype.toString;t.toString=A;var h=function(e){return"function"==typeof e};h(/x/)&&(h=function(e){return"function"==typeof e&&"[object Function]"===A.call(e)});var h;t.isFunction=h;var p=Array.isArray||function(e){return e&&"object"==typeof e?"[object Array]"===A.call(e):!1};t.isArray=p,t.escapeExpression=r,t.isEmpty=a,t.appendContextPath=s},function(e,t){"use strict";function n(e){this.string=e}n.prototype.toString=function(){return""+this.string},t["default"]=n},function(e,t){"use strict";function n(e,t){var n;t&&t.firstLine&&(n=t.firstLine,e+=" - "+n+":"+t.firstColumn);for(var o=Error.prototype.constructor.call(this,e),r=0;r<i.length;r++)this[i[r]]=o[i[r]];n&&(this.lineNumber=n,this.column=t.firstColumn)}var i=["description","fileName","lineNumber","message","name","number","stack"];n.prototype=new Error,t["default"]=n},function(e,t,n){"use strict";function i(e){var t=e&&e[0]||1,n=d;if(t!==n){if(n>t){var i=A[n],o=A[t];throw new u("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+i+") or downgrade your runtime to an older version ("+o+").")}throw new u("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+e[1]+").")}}function o(e,t){if(!t)throw new u("No environment passed to template");if(!e||!e.main)throw new u("Unknown template object: "+typeof e);t.VM.checkRevision(e.compiler);var n=function(n,i,o,r,a,s,l,d,A){a&&(r=c.extend({},r,a));var h=t.VM.invokePartial.call(this,n,o,r,s,l,d,A);if(null==h&&t.compile){var p={helpers:s,partials:l,data:d,depths:A};l[o]=t.compile(n,{data:void 0!==d,compat:e.compat},t),h=l[o](r,p)}if(null!=h){if(i){for(var f=h.split("\n"),g=0,m=f.length;m>g&&(f[g]||g+1!==m);g++)f[g]=i+f[g];h=f.join("\n")}return h}throw new u("The partial "+o+" could not be compiled when running in runtime-only mode")},i={lookup:function(e,t){for(var n=e.length,i=0;n>i;i++)if(e[i]&&null!=e[i][t])return e[i][t]},lambda:function(e,t){return"function"==typeof e?e.call(t):e},escapeExpression:c.escapeExpression,invokePartial:n,fn:function(t){return e[t]},programs:[],program:function(e,t,n){var i=this.programs[e],o=this.fn(e);return t||n?i=r(this,e,o,t,n):i||(i=this.programs[e]=r(this,e,o)),i},data:function(e,t){for(;e&&t--;)e=e._parent;return e},merge:function(e,t){var n=e||t;return e&&t&&e!==t&&(n=c.extend({},t,e)),n},noop:t.VM.noop,compilerInfo:e.compiler},o=function(t,n){n=n||{};var r=n.data;o._setup(n),!n.partial&&e.useData&&(r=l(t,r));
      var a;return e.useDepths&&(a=n.depths?[t].concat(n.depths):[t]),e.main.call(i,t,i.helpers,i.partials,r,a)};return o.isTop=!0,o._setup=function(n){n.partial?(i.helpers=n.helpers,i.partials=n.partials):(i.helpers=i.merge(n.helpers,t.helpers),e.usePartial&&(i.partials=i.merge(n.partials,t.partials)))},o._child=function(t,n,o){if(e.useDepths&&!o)throw new u("must pass parent depths");return r(i,t,e[t],n,o)},o}function r(e,t,n,i,o){var r=function(t,r){return r=r||{},n.call(e,t,e.helpers,e.partials,r.data||i,o&&[t].concat(o))};return r.program=t,r.depth=o?o.length:0,r}function a(e,t,n,i,o,r,a){var s={partial:!0,helpers:i,partials:o,data:r,depths:a};if(void 0===e)throw new u("The partial "+t+" could not be found");return e instanceof Function?e(n,s):void 0}function s(){return""}function l(e,t){return t&&"root"in t||(t=t?h(t):{},t.root=e),t}var c=n(123),u=n(125)["default"],d=n(122).COMPILER_REVISION,A=n(122).REVISION_CHANGES,h=n(122).createFrame;t.checkRevision=i,t.template=o,t.program=r,t.invokePartial=a,t.noop=s},function(e,t,n){var i,o;i=[n(47),n(46),n(45),n(48)],o=function(e,t,n,i){function o(e,t){return/touch/.test(e.type)?(e.originalEvent||e).changedTouches[0]["page"+t]:e["page"+t]}function r(e){var t=e||window.event;return e instanceof MouseEvent?"which"in t?3===t.which:"button"in t?2===t.button:!1:!1}function a(e,t,n){var i;return i=t instanceof MouseEvent||!t.touches&&!t.changedTouches?t:t.touches&&t.touches.length?t.touches[0]:t.changedTouches[0],{type:e,target:t.target,currentTarget:n,pageX:i.pageX,pageY:i.pageY}}function s(e){(e instanceof MouseEvent||e instanceof window.TouchEvent)&&(e.preventManipulation&&e.preventManipulation(),e.cancelable&&e.preventDefault&&e.preventDefault())}var l=!n.isUndefined(window.PointerEvent),c=!l&&i.isMobile(),u=!l&&!c,d=i.isFF()&&i.isOSX(),A=function(e,i){function c(e){(u||l&&"touch"!==e.pointerType)&&m(t.touchEvents.OVER,e)}function A(e){(u||l&&"touch"!==e.pointerType)&&m(t.touchEvents.MOVE,e)}function h(n){(u||l&&"touch"!==n.pointerType&&!e.contains(document.elementFromPoint(n.x,n.y)))&&m(t.touchEvents.OUT,n)}function p(t){w=t.target,j=o(t,"X"),b=o(t,"Y"),r(t)||(l?t.isPrimary&&(i.preventScrolling&&(v=t.pointerId,e.setPointerCapture(v)),e.addEventListener("pointermove",f),e.addEventListener("pointercancel",g),e.addEventListener("pointerup",g)):u&&(document.addEventListener("mousemove",f),d&&"object"===t.target.nodeName.toLowerCase()?e.addEventListener("click",g):document.addEventListener("mouseup",g)),w.addEventListener("touchmove",f),w.addEventListener("touchcancel",g),w.addEventListener("touchend",g))}function f(e){var n=t.touchEvents,r=6;if(E)m(n.DRAG,e);else{var a=o(e,"X"),l=o(e,"Y"),c=a-j,u=l-b;c*c+u*u>r*r&&(m(n.DRAG_START,e),E=!0,m(n.DRAG,e))}i.preventScrolling&&s(e)}function g(n){var o=t.touchEvents;l?(i.preventScrolling&&e.releasePointerCapture(v),e.removeEventListener("pointermove",f),e.removeEventListener("pointercancel",g),e.removeEventListener("pointerup",g)):u&&(document.removeEventListener("mousemove",f),document.removeEventListener("mouseup",g)),w.removeEventListener("touchmove",f),w.removeEventListener("touchcancel",g),w.removeEventListener("touchend",g),E?m(o.DRAG_END,n):i.directSelect&&n.target!==e||-1!==n.type.indexOf("cancel")||(l&&n instanceof window.PointerEvent?"touch"===n.pointerType?m(o.TAP,n):m(o.CLICK,n):u?m(o.CLICK,n):(m(o.TAP,n),s(n))),w=null,E=!1}function m(e,o){var r;if(i.enableDoubleTap&&(e===t.touchEvents.CLICK||e===t.touchEvents.TAP))if(n.now()-C<k){var s=e===t.touchEvents.CLICK?t.touchEvents.DOUBLE_CLICK:t.touchEvents.DOUBLE_TAP;r=a(s,o,y),L.trigger(s,r),C=0}else C=n.now();r=a(e,o,y),L.trigger(e,r)}var w,v,y=e,E=!1,j=0,b=0,C=0,k=300;i=i||{},l?(e.addEventListener("pointerdown",p),i.useHover&&(e.addEventListener("pointerover",c),e.addEventListener("pointerout",h)),i.useMove&&e.addEventListener("pointermove",A)):u&&(e.addEventListener("mousedown",p),i.useHover&&(e.addEventListener("mouseover",c),e.addEventListener("mouseout",h)),i.useMove&&e.addEventListener("mousemove",A)),e.addEventListener("touchstart",p);var L=this;return this.triggerEvent=m,this.destroy=function(){e.removeEventListener("touchstart",p),e.removeEventListener("mousedown",p),w&&(w.removeEventListener("touchmove",f),w.removeEventListener("touchcancel",g),w.removeEventListener("touchend",g)),l&&(i.preventScrolling&&e.releasePointerCapture(v),e.removeEventListener("pointerover",c),e.removeEventListener("pointerdown",p),e.removeEventListener("pointermove",f),e.removeEventListener("pointermove",A),e.removeEventListener("pointercancel",g),e.removeEventListener("pointerout",h),e.removeEventListener("pointerup",g)),e.removeEventListener("click",g),e.removeEventListener("mouseover",c),e.removeEventListener("mousemove",A),e.removeEventListener("mouseout",h),document.removeEventListener("mousemove",f),document.removeEventListener("mouseup",g)},this};return n.extend(A.prototype,e),A}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(55),n(62),n(45)],o=function(e,t,n,i){var o=t.style,r={back:!0,fontSize:15,fontFamily:"Arial,sans-serif",fontOpacity:100,color:"#FFF",backgroundColor:"#000",backgroundOpacity:100,edgeStyle:null,windowColor:"#FFF",windowOpacity:0,preprocessor:i.identity},a=function(a){function s(t){t=t||"";var n="jw-captions-window jw-reset";t?(w.innerHTML=t,m.className=n+" jw-captions-window-active"):(m.className=n,e.empty(w))}function l(e){f=e,u(h,f)}function c(e,t){var n=e.source,o=t.metadata;return n?o&&i.isNumber(o[n])?o[n]:!1:t.position}function u(e,t){if(e&&e.data&&t){var n=c(e,t);if(n!==!1){var i=e.data;if(!(p>=0&&d(i,p,n))){for(var o=-1,r=0;r<i.length;r++)if(d(i,r,n)){o=r;break}-1===o?s(""):o!==p&&(p=o,s(v.preprocessor(i[p].text)))}}}}function d(e,t,n){return e[t].begin<=n&&(!e[t].end||e[t].end>=n)&&(t===e.length-1||e[t+1].begin>=n)}function A(e,n,i){var o=t.hexToRgba("#000000",i);"dropshadow"===e?n.textShadow="0 2px 1px "+o:"raised"===e?n.textShadow="0 0 5px "+o+", 0 1px 5px "+o+", 0 2px 5px "+o:"depressed"===e?n.textShadow="0 -2px 1px "+o:"uniform"===e&&(n.textShadow="-2px 0 1px "+o+",2px 0 1px "+o+",0 -2px 1px "+o+",0 2px 1px "+o+",-1px 1px 1px "+o+",1px 1px 1px "+o+",1px -1px 1px "+o+",1px 1px 1px "+o)}var h,p,f,g,m,w,v={};g=document.createElement("div"),g.className="jw-captions jw-reset",this.show=function(){g.className="jw-captions jw-captions-enabled jw-reset"},this.hide=function(){g.className="jw-captions jw-reset"},this.populate=function(e){return p=-1,h=e,e?void u(e,f):void s("")},this.resize=function(){var e=g.clientWidth,t=Math.pow(e/400,.6);if(t){var n=v.fontSize*t;o(g,{fontSize:Math.round(n)+"px"})}},this.setup=function(e){if(m=document.createElement("div"),w=document.createElement("span"),m.className="jw-captions-window jw-reset",w.className="jw-captions-text jw-reset",v=i.extend({},r,e),e){var n=v.fontOpacity,s=v.windowOpacity,l=v.edgeStyle,c=v.backgroundColor,u={},d={color:t.hexToRgba(v.color,n),fontFamily:v.fontFamily,fontStyle:v.fontStyle,fontWeight:v.fontWeight,textDecoration:v.textDecoration};s&&(u.backgroundColor=t.hexToRgba(v.windowColor,s)),A(l,d,n),v.back?d.backgroundColor=t.hexToRgba(c,v.backgroundOpacity):null===l&&A("uniform",d),o(m,u),o(w,d)}m.appendChild(w),g.appendChild(m),this.populate(a.get("captionsTrack"))},this.element=function(){return g},a.on("change:playlistItem",function(){f=null,p=-1,s("")},this),a.on("change:captionsTrack",function(e,t){this.populate(t)},this),a.mediaController.on("seek",function(){p=-1},this),a.mediaController.on("time seek",l,this),a.mediaController.on("subtitlesTrackData",function(){u(h,f)},this),a.on("change:state",function(e,t){switch(t){case n.IDLE:case n.ERROR:case n.COMPLETE:this.hide();break;default:this.show()}},this)};return a}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(127),n(46),n(47),n(45)],o=function(e,t,n,i){var o=function(o,r,a){function s(e){return o.get("flashBlocked")?void 0:u?void u(e):void p.trigger(e.type===t.touchEvents.CLICK?"click":"tap")}function l(){return d?void d():void p.trigger("doubleClick")}var c,u,d,A={enableDoubleTap:!0,useMove:!0};i.extend(this,n),c=r,this.element=function(){return c};var h=new e(c,i.extend(A,a));h.on("click tap",s),h.on("doubleClick doubleTap",l),h.on("move",function(){p.trigger("move")}),h.on("over",function(){p.trigger("over")}),h.on("out",function(){p.trigger("out")}),this.clickHandler=s;var p=this;this.setAlternateClickHandlers=function(e,t){u=e,d=t||null},this.revertAlternateClickHandlers=function(){u=null,d=null}};return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(47),n(127),n(131),n(45)],o=function(e,t,n,i,o){var r=function(r){o.extend(this,t),this.model=r,this.el=e.createElement(i({}));var a=this;this.iconUI=new n(this.el).on("click tap",function(e){a.trigger(e.type)})};return o.extend(r.prototype,{element:function(){return this.el}}),r}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){return'<div class="jw-display-icon-container jw-background-color jw-reset">\n    <div class="jw-icon jw-icon-display jw-button-color jw-reset"></div>\n</div>\n'},useData:!0})},function(e,t,n){var i,o;i=[n(127),n(48),n(46),n(45),n(47),n(133)],o=function(e,t,n,i,o,r){var a=t.style,s={linktarget:"_blank",margin:8,hide:!1,position:"top-right"},l=function(l){var c,u,d=new Image,A=i.extend({},l.get("logo"));return i.extend(this,o),this.setup=function(o){if(u=i.extend({},s,A),u.hide="true"===u.hide.toString(),c=t.createElement(r()),u.file){u.hide&&t.addClass(c,"jw-hide"),t.addClass(c,"jw-logo-"+(u.position||s.position)),"top-right"===u.position&&(l.on("change:dock",this.topRight,this),l.on("change:controls",this.topRight,this),this.topRight(l)),l.set("logo",u),d.onload=function(){var e={backgroundImage:'url("'+this.src+'")',width:this.width,height:this.height};if(u.margin!==s.margin){var t=/(\w+)-(\w+)/.exec(u.position);3===t.length&&(e["margin-"+t[1]]=u.margin,e["margin-"+t[2]]=u.margin)}a(c,e),l.set("logoWidth",e.width)},d.src=u.file;var h=new e(c);h.on("click tap",function(e){t.exists(e)&&e.stopPropagation&&e.stopPropagation(),this.trigger(n.JWPLAYER_LOGO_CLICK,{link:u.link,linktarget:u.linktarget})},this),o.appendChild(c)}},this.topRight=function(e){var t=e.get("controls"),n=e.get("dock"),i=t&&(n&&n.length||e.get("sharing")||e.get("related"));a(c,{top:i?"3.5em":0})},this.element=function(){return c},this.position=function(){return u.position},this.destroy=function(){d.onload=null},this};return l}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){return'<div class="jw-logo jw-reset"></div>'},useData:!0})},function(e,t,n){var i,o;i=[n(48),n(45),n(47),n(58),n(127),n(136),n(135),n(142),n(144),n(146),n(147)],o=function(e,t,n,i,o,r,a,s,l,c,u){function d(e,t){var n=document.createElement("div");return n.className="jw-icon jw-icon-inline jw-button-color jw-reset "+e,n.style.display="none",t&&new o(n).on("click tap",function(){t()}),{element:function(){return n},toggle:function(e){e?this.show():this.hide()},show:function(){n.style.display=""},hide:function(){n.style.display="none"}}}function A(e){var t=document.createElement("span");return t.className="jw-text jw-reset "+e,t}function h(e){var t=new s(e);return t}function p(e,n){var i=document.createElement("div");return i.className="jw-group jw-controlbar-"+e+"-group jw-reset",t.each(n,function(e){e.element&&(e=e.element()),i.appendChild(e)}),i}function f(t,n){this._api=t,this._model=n,this._isMobile=e.isMobile(),this._compactModeMaxSize=400,this._maxCompactWidth=-1,this.setup()}return t.extend(f.prototype,n,{setup:function(){this.build(),this.initialize()},build:function(){var e,n,i,o,s=new a(this._model,this._api),f=new u("jw-icon-more");this._model.get("visualplaylist")!==!1&&(e=new l("jw-icon-playlist")),this._isMobile||(o=d("jw-icon-volume",this._api.setMute),n=new r("jw-slider-volume","horizontal"),i=new c(this._model,"jw-icon-volume")),this.elements={alt:A("jw-text-alt"),play:d("jw-icon-playback",this._api.play.bind(this,{reason:"interaction"})),prev:d("jw-icon-prev",this._api.playlistPrev.bind(this,{reason:"interaction"})),next:d("jw-icon-next",this._api.playlistNext.bind(this,{reason:"interaction"})),playlist:e,elapsed:A("jw-text-elapsed"),time:s,duration:A("jw-text-duration"),drawer:f,hd:h("jw-icon-hd"),cc:h("jw-icon-cc"),audiotracks:h("jw-icon-audio-tracks"),mute:o,volume:n,volumetooltip:i,cast:d("jw-icon-cast jw-off",this._api.castToggle),fullscreen:d("jw-icon-fullscreen",this._api.setFullscreen)},this.layout={left:[this.elements.play,this.elements.prev,this.elements.playlist,this.elements.next,this.elements.elapsed],center:[this.elements.time,this.elements.alt],right:[this.elements.duration,this.elements.hd,this.elements.cc,this.elements.audiotracks,this.elements.drawer,this.elements.mute,this.elements.cast,this.elements.volume,this.elements.volumetooltip,this.elements.fullscreen],drawer:[this.elements.hd,this.elements.cc,this.elements.audiotracks]},this.menus=t.compact([this.elements.playlist,this.elements.hd,this.elements.cc,this.elements.audiotracks,this.elements.volumetooltip]),this.layout.left=t.compact(this.layout.left),this.layout.center=t.compact(this.layout.center),this.layout.right=t.compact(this.layout.right),this.layout.drawer=t.compact(this.layout.drawer),this.el=document.createElement("div"),this.el.className="jw-controlbar jw-background-color jw-reset",this.elements.left=p("left",this.layout.left),this.elements.center=p("center",this.layout.center),this.elements.right=p("right",this.layout.right),this.el.appendChild(this.elements.left),this.el.appendChild(this.elements.center),this.el.appendChild(this.elements.right)},initialize:function(){this.elements.play.show(),this.elements.fullscreen.show(),this.elements.mute&&this.elements.mute.show(),this.onVolume(this._model,this._model.get("volume")),this.onPlaylist(this._model,this._model.get("playlist")),this.onPlaylistItem(this._model,this._model.get("playlistItem")),this.onMediaModel(this._model,this._model.get("mediaModel")),this.onCastAvailable(this._model,this._model.get("castAvailable")),this.onCastActive(this._model,this._model.get("castActive")),this.onCaptionsList(this._model,this._model.get("captionsList")),this._model.on("change:volume",this.onVolume,this),this._model.on("change:mute",this.onMute,this),this._model.on("change:playlist",this.onPlaylist,this),this._model.on("change:playlistItem",this.onPlaylistItem,this),this._model.on("change:mediaModel",this.onMediaModel,this),this._model.on("change:castAvailable",this.onCastAvailable,this),this._model.on("change:castActive",this.onCastActive,this),this._model.on("change:duration",this.onDuration,this),this._model.on("change:position",this.onElapsed,this),this._model.on("change:fullscreen",this.onFullscreen,this),this._model.on("change:captionsList",this.onCaptionsList,this),this._model.on("change:captionsIndex",this.onCaptionsIndex,this),this._model.on("change:compactUI",this.onCompactUI,this),this.elements.volume&&this.elements.volume.on("update",function(e){var t=e.percentage;this._api.setVolume(t)},this),this.elements.volumetooltip&&(this.elements.volumetooltip.on("update",function(e){var t=e.percentage;this._api.setVolume(t)},this),this.elements.volumetooltip.on("toggleValue",function(){this._api.setMute()},this)),this.elements.playlist&&this.elements.playlist.on("select",function(e){this._model.once("itemReady",function(){this._api.play({reason:"interaction"})},this),this._api.load(e)},this),this.elements.hd.on("select",function(e){this._model.getVideo().setCurrentQuality(e)},this),this.elements.hd.on("toggleValue",function(){this._model.getVideo().setCurrentQuality(0===this._model.getVideo().getCurrentQuality()?1:0)},this),this.elements.cc.on("select",function(e){this._api.setCurrentCaptions(e)},this),this.elements.cc.on("toggleValue",function(){var e=this._model.get("captionsIndex");this._api.setCurrentCaptions(e?0:1)},this),this.elements.audiotracks.on("select",function(e){this._model.getVideo().setCurrentAudioTrack(e)},this),new o(this.elements.duration).on("click tap",function(){if("DVR"===e.adaptiveType(this._model.get("duration"))){var t=this._model.get("position");this._api.seek(Math.max(i.dvrSeekLimit,t))}},this),new o(this.el).on("click tap drag",function(){this.trigger("userAction")},this),this.elements.drawer.on("open-drawer close-drawer",function(t,n){e.toggleClass(this.el,"jw-drawer-expanded",n.isOpen),n.isOpen||this.closeMenus()},this),t.each(this.menus,function(e){e.on("open-tooltip",this.closeMenus,this)},this)},onCaptionsList:function(e,t){var n=e.get("captionsIndex");this.elements.cc.setup(t,n),this.clearCompactMode()},onCaptionsIndex:function(e,t){this.elements.cc.selectItem(t)},onPlaylist:function(e,t){var n=t.length>1;this.elements.next.toggle(n),this.elements.prev.toggle(n),this.elements.playlist&&this.elements.playlist.setup(t,e.get("item"))},onPlaylistItem:function(e){this.elements.time.updateBuffer(0),this.elements.time.render(0),this.elements.duration.innerHTML="00:00",this.elements.elapsed.innerHTML="00:00",this.clearCompactMode();var t=e.get("item");this.elements.playlist&&this.elements.playlist.selectItem(t),this.elements.audiotracks.setup()},onMediaModel:function(n,i){i.on("change:levels",function(e,t){this.elements.hd.setup(t,e.get("currentLevel")),this.clearCompactMode()},this),i.on("change:currentLevel",function(e,t){this.elements.hd.selectItem(t)},this),i.on("change:audioTracks",function(e,n){var i=t.map(n,function(e){return{label:e.name}});this.elements.audiotracks.setup(i,e.get("currentAudioTrack"),{toggle:!1}),this.clearCompactMode()},this),i.on("change:currentAudioTrack",function(e,t){this.elements.audiotracks.selectItem(t)},this),i.on("change:state",function(t,n){"complete"===n&&(this.elements.drawer.closeTooltip(),e.removeClass(this.el,"jw-drawer-expanded"))},this)},onVolume:function(e,t){this.renderVolume(e.get("mute"),t)},onMute:function(e,t){this.renderVolume(t,e.get("volume"))},renderVolume:function(t,n){this.elements.mute&&e.toggleClass(this.elements.mute.element(),"jw-off",t),this.elements.volume&&this.elements.volume.render(t?0:n),this.elements.volumetooltip&&(this.elements.volumetooltip.volumeSlider.render(t?0:n),e.toggleClass(this.elements.volumetooltip.element(),"jw-off",t))},onCastAvailable:function(e,t){this.elements.cast.toggle(t),this.clearCompactMode()},onCastActive:function(t,n){e.toggleClass(this.elements.cast.element(),"jw-off",!n)},onElapsed:function(t,n){var i,o=t.get("duration");i="DVR"===e.adaptiveType(o)?"-"+e.timeFormat(-o):e.timeFormat(n),this.elements.elapsed.innerHTML=i},onDuration:function(t,n){var i;"DVR"===e.adaptiveType(n)?(i="Live",this.clearCompactMode()):i=e.timeFormat(n),this.elements.duration.innerHTML=i},onFullscreen:function(t,n){e.toggleClass(this.elements.fullscreen.element(),"jw-off",n)},element:function(){return this.el},getVisibleBounds:function(){var t,n=this.el,i=getComputedStyle?getComputedStyle(n):n.currentStyle;return"table"===i.display?e.bounds(n):(n.style.visibility="hidden",n.style.display="table",t=e.bounds(n),n.style.visibility=n.style.display="",t)},setAltText:function(e){this.elements.alt.innerHTML=e},addCues:function(e){this.elements.time&&(t.each(e,function(e){this.elements.time.addCue(e)},this),this.elements.time.drawCues())},closeMenus:function(e){t.each(this.menus,function(t){e&&e.target===t.el||t.closeTooltip(e)})},hideComponents:function(){this.closeMenus(),this.elements.drawer.closeTooltip(),e.removeClass(this.el,"jw-drawer-expanded")},clearCompactMode:function(){this._maxCompactWidth=-1,this._model.set("compactUI",!1),this._containerWidth&&this.checkCompactMode(this._containerWidth)},setCompactModeBounds:function(){if(this.element().offsetWidth>0){var t=this.elements.left.offsetWidth+this.elements.right.offsetWidth;if("LIVE"===e.adaptiveType(this._model.get("duration")))this._maxCompactWidth=t+this.elements.alt.offsetWidth;else{var n=t+(this.elements.center.offsetWidth-this.elements.time.el.offsetWidth),i=.2;this._maxCompactWidth=n/(1-i)}}},checkCompactMode:function(e){-1===this._maxCompactWidth&&this.setCompactModeBounds(),this._containerWidth=e,-1!==this._maxCompactWidth&&(e>=this._compactModeMaxSize&&e>this._maxCompactWidth?this._model.set("compactUI",!1):(e<this._compactModeMaxSize||e<=this._maxCompactWidth)&&this._model.set("compactUI",!0))},onCompactUI:function(n,i){e.removeClass(this.el,"jw-drawer-expanded"),this.elements.drawer.setup(this.layout.drawer,i),(!i||this.elements.drawer.activeContents.length<2)&&t.each(this.layout.drawer,function(e){this.elements.right.insertBefore(e.el,this.elements.drawer.el)},this)}}),f}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(48),n(58),n(136),n(139),n(140),n(141)],o=function(e,t,n,i,o,r,a){var s=o.extend({setup:function(){this.text=document.createElement("span"),this.text.className="jw-text jw-reset",this.img=document.createElement("div"),this.img.className="jw-reset";var e=document.createElement("div");e.className="jw-time-tip jw-background-color jw-reset",e.appendChild(this.img),e.appendChild(this.text),t.removeClass(this.el,"jw-hidden"),this.addContent(e)},image:function(e){t.style(this.img,e)},update:function(e){this.text.innerHTML=e}}),l=i.extend({constructor:function(t,n){this._model=t,this._api=n,this.timeTip=new s("jw-tooltip-time"),this.timeTip.setup(),this.cues=[],this.seekThrottled=e.throttle(this.performSeek,400),this._model.on("change:playlistItem",this.onPlaylistItem,this).on("change:position",this.onPosition,this).on("change:duration",this.onDuration,this).on("change:buffer",this.onBuffer,this),i.call(this,"jw-slider-time","horizontal")},setup:function(){i.prototype.setup.apply(this,arguments),this._model.get("playlistItem")&&this.onPlaylistItem(this._model,this._model.get("playlistItem")),this.elementRail.appendChild(this.timeTip.element()),this.el.addEventListener("mousemove",this.showTimeTooltip.bind(this),!1),this.el.addEventListener("mouseout",this.hideTimeTooltip.bind(this),!1)},limit:function(i){if(this.activeCue&&e.isNumber(this.activeCue.pct))return this.activeCue.pct;var o=this._model.get("duration"),r=t.adaptiveType(o);if("DVR"===r){var a=(1-i/100)*o,s=this._model.get("position"),l=Math.min(a,Math.max(n.dvrSeekLimit,s)),c=100*l/o;return 100-c}return i},update:function(e){this.seekTo=e,this.seekThrottled(),i.prototype.update.apply(this,arguments)},dragStart:function(){this._model.set("scrubbing",!0),i.prototype.dragStart.apply(this,arguments)},dragEnd:function(){i.prototype.dragEnd.apply(this,arguments),this._model.set("scrubbing",!1)},onSeeked:function(){this._model.get("scrubbing")&&this.performSeek()},onBuffer:function(e,t){this.updateBuffer(t)},onPosition:function(e,t){this.updateTime(t,e.get("duration"))},onDuration:function(e,t){this.updateTime(e.get("position"),t)},updateTime:function(e,n){var i=0;if(n){var o=t.adaptiveType(n);"DVR"===o?i=(n-e)/n*100:"VOD"===o&&(i=e/n*100)}this.render(i)},onPlaylistItem:function(t,n){this.reset(),t.mediaModel.on("seeked",this.onSeeked,this);var i=n.tracks;e.each(i,function(e){e&&e.kind&&"thumbnails"===e.kind.toLowerCase()?this.loadThumbnails(e.file):e&&e.kind&&"chapters"===e.kind.toLowerCase()&&this.loadChapters(e.file)},this)},performSeek:function(){var e,n=this.seekTo,i=this._model.get("duration"),o=t.adaptiveType(i);0===i?this._api.play():"DVR"===o?(e=(100-n)/100*i,this._api.seek(e)):(e=n/100*i,this._api.seek(Math.min(e,i-.25)))},showTimeTooltip:function(e){var i=this._model.get("duration");if(0!==i){var o=t.bounds(this.elementRail),r=e.pageX?e.pageX-o.left:e.x;r=t.between(r,0,o.width);var a=r/o.width,s=i*a;0>i&&(s=i-s);var l;if(this.activeCue)l=this.activeCue.text;else{var c=!0;l=t.timeFormat(s,c),0>i&&s>n.dvrSeekLimit&&(l="Live")}this.timeTip.update(l),this.showThumbnail(s),t.addClass(this.timeTip.el,"jw-open"),this.timeTip.el.style.left=100*a+"%"}},hideTimeTooltip:function(){t.removeClass(this.timeTip.el,"jw-open")},reset:function(){this.resetChapters(),this.resetThumbnails()}});return e.extend(l.prototype,r,a),l}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(137),n(127),n(138),n(48)],o=function(e,t,n,i){var o=e.extend({constructor:function(e,t){this.className=e+" jw-background-color jw-reset",this.orientation=t,this.dragStartListener=this.dragStart.bind(this),this.dragMoveListener=this.dragMove.bind(this),this.dragEndListener=this.dragEnd.bind(this),this.tapListener=this.tap.bind(this),this.setup()},setup:function(){var e={"default":this["default"],className:this.className,orientation:"jw-slider-"+this.orientation};this.el=i.createElement(n(e)),this.elementRail=this.el.getElementsByClassName("jw-slider-container")[0],this.elementBuffer=this.el.getElementsByClassName("jw-buffer")[0],this.elementProgress=this.el.getElementsByClassName("jw-progress")[0],this.elementThumb=this.el.getElementsByClassName("jw-knob")[0],this.userInteract=new t(this.element(),{preventScrolling:!0}),this.userInteract.on("dragStart",this.dragStartListener),this.userInteract.on("drag",this.dragMoveListener),this.userInteract.on("dragEnd",this.dragEndListener),this.userInteract.on("tap click",this.tapListener)},dragStart:function(){this.trigger("dragStart"),this.railBounds=i.bounds(this.elementRail)},dragEnd:function(e){this.dragMove(e),this.trigger("dragEnd")},dragMove:function(e){var t,n,o=this.railBounds=this.railBounds?this.railBounds:i.bounds(this.elementRail);"horizontal"===this.orientation?(t=e.pageX,n=t<o.left?0:t>o.right?100:100*i.between((t-o.left)/o.width,0,1)):(t=e.pageY,n=t>=o.bottom?0:t<=o.top?100:100*i.between((o.height-(t-o.top))/o.height,0,1));var r=this.limit(n);return this.render(r),this.update(r),!1},tap:function(e){this.railBounds=i.bounds(this.elementRail),this.dragMove(e)},limit:function(e){return e},update:function(e){this.trigger("update",{percentage:e})},render:function(e){e=Math.max(0,Math.min(e,100)),"horizontal"===this.orientation?(this.elementThumb.style.left=e+"%",this.elementProgress.style.width=e+"%"):(this.elementThumb.style.bottom=e+"%",this.elementProgress.style.height=e+"%")},updateBuffer:function(e){this.elementBuffer.style.width=e+"%"},element:function(){return this.el}});return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(47),n(45)],o=function(e,t){function n(){}var i=function(e,n){var i,o=this;i=e&&t.has(e,"constructor")?e.constructor:function(){return o.apply(this,arguments)},t.extend(i,o,n);var r=function(){this.constructor=i};return r.prototype=o.prototype,i.prototype=new r,e&&t.extend(i.prototype,e),i.__super__=o.prototype,i};return n.extend=i,t.extend(n.prototype,e),n}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){var o,r="function",a=t.helperMissing,s=this.escapeExpression;return'<div class="'+s((o=null!=(o=t.className||(null!=e?e.className:e))?o:a,typeof o===r?o.call(e,{name:"className",hash:{},data:i}):o))+" "+s((o=null!=(o=t.orientation||(null!=e?e.orientation:e))?o:a,typeof o===r?o.call(e,{name:"orientation",hash:{},data:i}):o))+' jw-reset">\n    <div class="jw-slider-container jw-reset">\n        <div class="jw-rail jw-reset"></div>\n        <div class="jw-buffer jw-reset"></div>\n        <div class="jw-progress jw-reset"></div>\n        <div class="jw-knob jw-reset"></div>\n    </div>\n</div>'},useData:!0})},function(e,t,n){var i,o;i=[n(137),n(48)],o=function(e,t){var n=e.extend({constructor:function(e){this.el=document.createElement("div"),this.el.className="jw-icon jw-icon-tooltip "+e+" jw-button-color jw-reset jw-hidden",this.container=document.createElement("div"),this.container.className="jw-overlay jw-reset",this.openClass="jw-open",this.componentType="tooltip",this.el.appendChild(this.container)},addContent:function(e){this.content&&this.removeContent(),this.content=e,this.container.appendChild(e)},removeContent:function(){this.content&&(this.container.removeChild(this.content),this.content=null)},hasContent:function(){return!!this.content},element:function(){return this.el},openTooltip:function(e){this.trigger("open-"+this.componentType,e,{isOpen:!0}),this.isOpen=!0,t.toggleClass(this.el,this.openClass,this.isOpen)},closeTooltip:function(e){this.trigger("close-"+this.componentType,e,{isOpen:!1}),this.isOpen=!1,t.toggleClass(this.el,this.openClass,this.isOpen)},toggleOpenState:function(e){this.isOpen?this.closeTooltip(e):this.openTooltip(e)}});return n}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(48),n(112)],o=function(e,t,n){function i(e,t){this.time=e,this.text=t,this.el=document.createElement("div"),this.el.className="jw-cue jw-reset"}e.extend(i.prototype,{align:function(e){if("%"===this.time.toString().slice(-1))this.pct=this.time;else{var t=this.time/e*100;this.pct=t+"%"}this.el.style.left=this.pct}});var o={loadChapters:function(e){t.ajax(e,this.chaptersLoaded.bind(this),this.chaptersFailed,{plainText:!0})},chaptersLoaded:function(t){var i=n(t.responseText);e.isArray(i)&&(e.each(i,this.addCue,this),this.drawCues())},chaptersFailed:function(){},addCue:function(e){this.cues.push(new i(e.begin,e.text))},drawCues:function(){var t=this._model.mediaModel.get("duration");if(!t||0>=t)return void this._model.mediaModel.once("change:duration",this.drawCues,this);var n=this;e.each(this.cues,function(e){e.align(t),e.el.addEventListener("mouseover",function(){n.activeCue=e}),e.el.addEventListener("mouseout",function(){n.activeCue=null}),n.elementRail.appendChild(e.el)})},resetChapters:function(){e.each(this.cues,function(e){e.el.parentNode&&e.el.parentNode.removeChild(e.el)},this),this.cues=[]}};return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(48),n(112)],o=function(e,t,n){function i(e){this.begin=e.begin,this.end=e.end,this.img=e.text}var o={loadThumbnails:function(e){e&&(this.vttPath=e.split("?")[0].split("/").slice(0,-1).join("/"),this.individualImage=null,t.ajax(e,this.thumbnailsLoaded.bind(this),this.thumbnailsFailed.bind(this),{plainText:!0}))},thumbnailsLoaded:function(t){var o=n(t.responseText);e.isArray(o)&&(e.each(o,function(e){this.thumbnails.push(new i(e))},this),this.drawCues())},thumbnailsFailed:function(){},chooseThumbnail:function(t){var n=e.sortedIndex(this.thumbnails,{end:t},e.property("end"));n>=this.thumbnails.length&&(n=this.thumbnails.length-1);var i=this.thumbnails[n].img;return i.indexOf("://")<0&&(i=this.vttPath?this.vttPath+"/"+i:i),i},loadThumbnail:function(t){var n=this.chooseThumbnail(t),i={display:"block",margin:"0 auto",backgroundPosition:"0 0"},o=n.indexOf("#xywh");if(o>0)try{var r=/(.+)\#xywh=(\d+),(\d+),(\d+),(\d+)/.exec(n);n=r[1],i.backgroundPosition=-1*r[2]+"px "+-1*r[3]+"px",i.width=r[4],i.height=r[5]}catch(a){return}else this.individualImage||(this.individualImage=new Image,this.individualImage.onload=e.bind(function(){this.individualImage.onload=null,this.timeTip.image({width:this.individualImage.width,height:this.individualImage.height})},this),this.individualImage.src=n);return i.backgroundImage='url("'+n+'")',i},showThumbnail:function(e){this.thumbnails.length<1||this.timeTip.image(this.loadThumbnail(e))},resetThumbnails:function(){this.timeTip.image({backgroundImage:"",width:0,height:0}),this.thumbnails=[]}};return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(139),n(48),n(45),n(127),n(143)],o=function(e,t,n,i,o){var r=e.extend({setup:function(e,r,a){this.iconUI||(this.iconUI=new i(this.el,{useHover:!0,directSelect:!0}),this.toggleValueListener=this.toggleValue.bind(this),this.toggleOpenStateListener=this.toggleOpenState.bind(this),this.openTooltipListener=this.openTooltip.bind(this),this.closeTooltipListener=this.closeTooltip.bind(this),this.selectListener=this.select.bind(this)),this.reset(),e=n.isArray(e)?e:[],t.toggleClass(this.el,"jw-hidden",e.length<2);var s=e.length>2||2===e.length&&a&&a.toggle===!1,l=!s&&2===e.length;
      if(t.toggleClass(this.el,"jw-toggle",l),t.toggleClass(this.el,"jw-button-color",!l),this.isActive=s||l,s){t.removeClass(this.el,"jw-off"),this.iconUI.on("tap",this.toggleOpenStateListener).on("over",this.openTooltipListener).on("out",this.closeTooltipListener);var c=o(e),u=t.createElement(c);this.addContent(u),this.contentUI=new i(this.content).on("click tap",this.selectListener)}else l&&this.iconUI.on("click tap",this.toggleValueListener);this.selectItem(r)},toggleValue:function(){this.trigger("toggleValue")},select:function(e){if(e.target.parentElement===this.content){var i=t.classList(e.target),o=n.find(i,function(e){return 0===e.indexOf("jw-item")});o&&(this.trigger("select",parseInt(o.split("-")[2])),this.closeTooltipListener())}},selectItem:function(e){if(this.content)for(var n=0;n<this.content.children.length;n++)t.toggleClass(this.content.children[n],"jw-active-option",e===n);else t.toggleClass(this.el,"jw-off",0===e)},reset:function(){t.addClass(this.el,"jw-off"),this.iconUI.off(),this.contentUI&&this.contentUI.off().destroy(),this.removeContent()}});return r}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({1:function(e,t,n,i){var o=this.lambda,r=this.escapeExpression;return"        <li class='jw-text jw-option jw-item-"+r(o(i&&i.index,e))+" jw-reset'>"+r(o(null!=e?e.label:e,e))+"</li>\n"},compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){var o,r='<ul class="jw-menu jw-background-color jw-reset">\n';return o=t.each.call(e,e,{name:"each",hash:{},fn:this.program(1,i),inverse:this.noop,data:i}),null!=o&&(r+=o),r+"</ul>"},useData:!0})},function(e,t,n){var i,o;i=[n(48),n(45),n(139),n(127),n(145)],o=function(e,t,n,i,o){var r=n.extend({setup:function(n,o){if(this.iconUI||(this.iconUI=new i(this.el,{useHover:!0}),this.toggleOpenStateListener=this.toggleOpenState.bind(this),this.openTooltipListener=this.openTooltip.bind(this),this.closeTooltipListener=this.closeTooltip.bind(this),this.selectListener=this.onSelect.bind(this)),this.reset(),n=t.isArray(n)?n:[],e.toggleClass(this.el,"jw-hidden",n.length<2),n.length>=2){this.iconUI=new i(this.el,{useHover:!0}).on("tap",this.toggleOpenStateListener).on("over",this.openTooltipListener).on("out",this.closeTooltipListener);var r=this.menuTemplate(n,o),a=e.createElement(r);this.addContent(a),this.contentUI=new i(this.content),this.contentUI.on("click tap",this.selectListener)}this.originalList=n},menuTemplate:function(e,n){var i=t.map(e,function(e,t){return{active:t===n,label:t+1+".",title:e.title}});return o(i)},onSelect:function(n){var i=n.target;if("UL"!==i.tagName){"LI"!==i.tagName&&(i=i.parentElement);var o=e.classList(i),r=t.find(o,function(e){return 0===e.indexOf("jw-item")});r&&(this.trigger("select",parseInt(r.split("-")[2])),this.closeTooltip())}},selectItem:function(e){this.setup(this.originalList,e)},reset:function(){this.iconUI.off(),this.contentUI&&this.contentUI.off().destroy(),this.removeContent()}});return r}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({1:function(e,t,n,i){var o,r="";return o=t["if"].call(e,null!=e?e.active:e,{name:"if",hash:{},fn:this.program(2,i),inverse:this.program(4,i),data:i}),null!=o&&(r+=o),r},2:function(e,t,n,i){var o=this.lambda,r=this.escapeExpression;return"                <li class='jw-option jw-text jw-active-option jw-item-"+r(o(i&&i.index,e))+' jw-reset\'>\n                    <span class="jw-label jw-reset"><span class="jw-icon jw-icon-play jw-reset"></span></span>\n                    <span class="jw-name jw-reset">'+r(o(null!=e?e.title:e,e))+"</span>\n                </li>\n"},4:function(e,t,n,i){var o=this.lambda,r=this.escapeExpression;return"                <li class='jw-option jw-text jw-item-"+r(o(i&&i.index,e))+' jw-reset\'>\n                    <span class="jw-label jw-reset">'+r(o(null!=e?e.label:e,e))+'</span>\n                    <span class="jw-name jw-reset">'+r(o(null!=e?e.title:e,e))+"</span>\n                </li>\n"},compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){var o,r='<div class="jw-menu jw-playlist-container jw-background-color jw-reset">\n\n    <div class="jw-tooltip-title jw-reset">\n        <span class="jw-icon jw-icon-inline jw-icon-playlist jw-reset"></span>\n        <span class="jw-text jw-reset">PLAYLIST</span>\n    </div>\n\n    <ul class="jw-playlist jw-reset">\n';return o=t.each.call(e,e,{name:"each",hash:{},fn:this.program(1,i),inverse:this.noop,data:i}),null!=o&&(r+=o),r+"    </ul>\n</div>"},useData:!0})},function(e,t,n){var i,o;i=[n(139),n(136),n(127),n(48)],o=function(e,t,n,i){var o=e.extend({constructor:function(o,r){this._model=o,e.call(this,r),this.volumeSlider=new t("jw-slider-volume jw-volume-tip","vertical"),this.addContent(this.volumeSlider.element()),this.volumeSlider.on("update",function(e){this.trigger("update",e)},this),i.removeClass(this.el,"jw-hidden"),new n(this.el,{useHover:!0,directSelect:!0}).on("click",this.toggleValue,this).on("tap",this.toggleOpenState,this).on("over",this.openTooltip,this).on("out",this.closeTooltip,this),this._model.on("change:volume",this.onVolume,this)},toggleValue:function(){this.trigger("toggleValue")}});return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(139),n(48),n(45),n(127)],o=function(e,t,n,i){var o=e.extend({constructor:function(t){e.call(this,t),this.container.className="jw-overlay-horizontal jw-reset",this.openClass="jw-open-drawer",this.componentType="drawer"},setup:function(e,o){this.iconUI||(this.iconUI=new i(this.el,{useHover:!0,directSelect:!0}),this.toggleOpenStateListener=this.toggleOpenState.bind(this),this.openTooltipListener=this.openTooltip.bind(this),this.closeTooltipListener=this.closeTooltip.bind(this)),this.reset(),e=n.isArray(e)?e:[],this.activeContents=n.filter(e,function(e){return e.isActive}),t.toggleClass(this.el,"jw-hidden",!o||this.activeContents.length<2),o&&this.activeContents.length>1&&(t.removeClass(this.el,"jw-off"),this.iconUI.on("tap",this.toggleOpenStateListener).on("over",this.openTooltipListener).on("out",this.closeTooltipListener),n.each(e,function(e){this.container.appendChild(e.el)},this))},reset:function(){t.addClass(this.el,"jw-off"),this.iconUI.off(),this.contentUI&&this.contentUI.off().destroy(),this.removeContent()}});return o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(48)],o=function(e,t){function n(e,t){t.off("change:mediaType",null,this),t.on("change:mediaType",function(t,n){"audio"===n&&this.setImage(e.get("playlistItem").image)},this)}function i(e,n){var i=e.get("autostart")&&!t.isMobile()||e.get("item")>0;return i?(this.setImage(null),e.off("change:state",null,this),void e.on("change:state",function(e,t){"complete"!==t&&"idle"!==t&&"error"!==t||this.setImage(n.image)},this)):void this.setImage(n.image)}var o=function(e){this.model=e,e.on("change:playlistItem",i,this),e.on("change:mediaModel",n,this)};return e.extend(o.prototype,{setup:function(e){this.el=e;var t=this.model.get("playlistItem");t&&this.setImage(t.image)},setImage:function(n){this.model.off("change:state",null,this);var i="";e.isString(n)&&(i='url("'+n+'")'),t.style(this.el,{backgroundImage:i})},element:function(){return this.el}}),o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(150),n(45),n(59)],o=function(e,t,n){var i={free:"f",premium:"r",enterprise:"e",ads:"a",unlimited:"u",trial:"t"},o=function(){};return t.extend(o.prototype,e.prototype,{buildArray:function(){var t=e.prototype.buildArray.apply(this,arguments),o=this.model.get("edition"),r="http://www.cameratag.com";if(t.items[0].link=r,this.model.get("abouttext")){t.items[0].showLogo=!1,t.items.push(t.items.shift());var a={title:this.model.get("abouttext"),link:this.model.get("aboutlink")||r};t.items.unshift(a)}return t}}),o}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(48),n(151),n(45),n(127),n(59)],o=function(e,t,n,i,o){var r=function(){};return n.extend(r.prototype,{buildArray:function(){var t=o.split("+"),n=t[0],i={items:[{title:"Powered by CameraTag",featured:false,showLogo:false,link:"http://www.cameratag.com"}]},r=n.indexOf("-")>0,a=t[1];if(r&&a){var s=a.split(".");i.items.push({title:"build: ("+s[0]+"."+s[1]+")",link:"#"})}var l=this.model.get("provider").name;if(l.indexOf("flash")>=0){var c="Flash Version "+e.flashVersion();i.items.push({title:c,link:"http://www.adobe.com/software/flash/about/"})}return i},buildMenu:function(){var n=this.buildArray();return e.createElement(t(n))},updateHtml:function(){this.el.innerHTML=this.buildMenu().innerHTML},rightClick:function(e){return this.lazySetup(),this.mouseOverContext?!1:(this.hideMenu(),this.showMenu(e),!1)},getOffset:function(e){for(var t=e.target,n=e.offsetX||e.layerX,i=e.offsetY||e.layerY;t!==this.playerElement;)n+=t.offsetLeft,i+=t.offsetTop,t=t.parentNode;return{x:n,y:i}},showMenu:function(t){var n=this.getOffset(t);return this.el.style.left=n.x+"px",this.el.style.top=n.y+"px",e.addClass(this.playerElement,"jw-flag-rightclick-open"),e.addClass(this.el,"jw-open"),!1},hideMenu:function(){this.mouseOverContext||(e.removeClass(this.playerElement,"jw-flag-rightclick-open"),e.removeClass(this.el,"jw-open"))},lazySetup:function(){this.el||(this.el=this.buildMenu(),this.layer.appendChild(this.el),this.hideMenuHandler=this.hideMenu.bind(this),this.addOffListener(this.playerElement),this.addOffListener(document),this.model.on("change:provider",this.updateHtml,this),this.elementUI=new i(this.el,{useHover:!0}).on("over",function(){this.mouseOverContext=!0},this).on("out",function(){this.mouseOverContext=!1},this))},setup:function(e,t,n){this.playerElement=t,this.model=e,this.mouseOverContext=!1,this.layer=n,t.oncontextmenu=this.rightClick.bind(this)},addOffListener:function(e){e.addEventListener("mousedown",this.hideMenuHandler),e.addEventListener("touchstart",this.hideMenuHandler),e.addEventListener("pointerdown",this.hideMenuHandler)},removeOffListener:function(e){e.removeEventListener("mousedown",this.hideMenuHandler),e.removeEventListener("touchstart",this.hideMenuHandler),e.removeEventListener("pointerdown",this.hideMenuHandler)},destroy:function(){this.el&&(this.hideMenu(),this.elementUI.off(),this.removeOffListener(this.playerElement),this.removeOffListener(document),this.hideMenuHandler=null,this.el=null),this.playerElement&&(this.playerElement.oncontextmenu=null,this.playerElement=null),this.model&&(this.model.off("change:provider",this.updateHtml),this.model=null)}}),r}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({1:function(e,t,n,i){var o,r,a="function",s=t.helperMissing,l=this.escapeExpression,c='        <li class="jw-reset';return o=t["if"].call(e,null!=e?e.featured:e,{name:"if",hash:{},fn:this.program(2,i),inverse:this.noop,data:i}),null!=o&&(c+=o),c+='">\n            <a href="'+l((r=null!=(r=t.link||(null!=e?e.link:e))?r:s,typeof r===a?r.call(e,{name:"link",hash:{},data:i}):r))+'" class="jw-reset" target="_top">\n',o=t["if"].call(e,null!=e?e.showLogo:e,{name:"if",hash:{},fn:this.program(4,i),inverse:this.noop,data:i}),null!=o&&(c+=o),c+"                "+l((r=null!=(r=t.title||(null!=e?e.title:e))?r:s,typeof r===a?r.call(e,{name:"title",hash:{},data:i}):r))+"\n            </a>\n        </li>\n"},2:function(e,t,n,i){return" jw-featured"},4:function(e,t,n,i){return'                <span class="jw-icon jw-rightclick-logo jw-reset"></span>\n'},compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){var o,r='<div class="jw-rightclick jw-reset">\n    <ul class="jw-reset">\n';return o=t.each.call(e,null!=e?e.items:e,{name:"each",hash:{},fn:this.program(1,i),inverse:this.noop,data:i}),null!=o&&(r+=o),r+"    </ul>\n</div>"},useData:!0})},function(e,t,n){var i,o;i=[n(45),n(48)],o=function(e,t){var n=function(e){this.model=e,this.model.on("change:playlistItem",this.playlistItem,this)};return e.extend(n.prototype,{hide:function(){this.el.style.display="none"},show:function(){this.el.style.display=""},setup:function(e){this.el=e;var t=this.el.getElementsByTagName("div");this.title=t[0],this.description=t[1],this.model.get("playlistItem")&&this.playlistItem(this.model,this.model.get("playlistItem")),this.model.on("change:logoWidth",this.update,this),this.model.on("change:dock",this.update,this)},update:function(e){var n={paddingLeft:0,paddingRight:0},i=e.get("controls"),o=e.get("dock"),r=e.get("logo");if(r){var a=1*(""+r.margin).replace("px",""),s=e.get("logoWidth")+(isNaN(a)?0:a);"top-left"===r.position?n.paddingLeft=s:"top-right"===r.position&&(n.paddingRight=s)}if(i&&o&&o.length){var l=56*o.length;n.paddingRight=Math.max(n.paddingRight,l)}t.style(this.el,n)},playlistItem:function(e,t){if(e.get("displaytitle")||e.get("displaydescription")){var n="",i="";t.title&&e.get("displaytitle")&&(n=t.title),t.description&&e.get("displaydescription")&&(i=t.description),this.updateText(n,i)}else this.hide()},updateText:function(e,t){this.title.innerHTML=e,this.description.innerHTML=t,this.title.firstChild||this.description.firstChild?this.show():this.hide()},element:function(){return this.el}}),n}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){var o,r="function",a=t.helperMissing,s=this.escapeExpression;return'<div id="'+s((o=null!=(o=t.id||(null!=e?e.id:e))?o:a,typeof o===r?o.call(e,{name:"id",hash:{},data:i}):o))+'" class="jwplayer jw-reset" tabindex="0">\n    <div class="jw-aspect jw-reset"></div>\n    <div class="jw-media jw-reset"></div>\n    <div class="jw-preview jw-reset"></div>\n    <div class="jw-title jw-reset">\n        <div class="jw-title-primary jw-reset"></div>\n        <div class="jw-title-secondary jw-reset"></div>\n    </div>\n    <div class="jw-overlays jw-reset"></div>\n    <div class="jw-controls jw-reset"></div>\n</div>'},useData:!0})},function(e,t,n){var i,o;i=[n(48),n(46),n(127),n(47),n(45),n(155)],o=function(e,t,n,i,o,r){var a=function(e){this.model=e,this.setup()};return o.extend(a.prototype,i,{setup:function(){this.destroy(),this.skipMessage=this.model.get("skipText"),this.skipMessageCountdown=this.model.get("skipMessage"),this.setWaitTime(this.model.get("skipOffset"));var t=r();this.el=e.createElement(t),this.skiptext=this.el.getElementsByClassName("jw-skiptext")[0],this.skipAdOnce=o.once(this.skipAd.bind(this)),new n(this.el).on("click tap",o.bind(function(){this.skippable&&this.skipAdOnce()},this)),this.model.on("change:duration",this.onChangeDuration,this),this.model.on("change:position",this.onChangePosition,this),this.onChangeDuration(this.model,this.model.get("duration")),this.onChangePosition(this.model,this.model.get("position"))},updateMessage:function(e){this.skiptext.innerHTML=e},updateCountdown:function(e){this.updateMessage(this.skipMessageCountdown.replace(/xx/gi,Math.ceil(this.waitTime-e)))},onChangeDuration:function(t,n){if(n){if(this.waitPercentage){if(!n)return;this.itemDuration=n,this.setWaitTime(this.waitPercentage),delete this.waitPercentage}e.removeClass(this.el,"jw-hidden")}},onChangePosition:function(t,n){this.waitTime-n>0?this.updateCountdown(n):(this.updateMessage(this.skipMessage),this.skippable=!0,e.addClass(this.el,"jw-skippable"))},element:function(){return this.el},setWaitTime:function(t){if(o.isString(t)&&"%"===t.slice(-1)){var n=parseFloat(t);return void(this.itemDuration&&!isNaN(n)?this.waitTime=this.itemDuration*n/100:this.waitPercentage=t)}o.isNumber(t)?this.waitTime=t:"string"===e.typeOf(t)?this.waitTime=e.seconds(t):isNaN(Number(t))?this.waitTime=0:this.waitTime=Number(t)},skipAd:function(){this.trigger(t.JWPLAYER_AD_SKIPPED)},destroy:function(){this.el&&(this.el.removeEventListener("click",this.skipAdOnce),this.el.parentElement&&this.el.parentElement.removeChild(this.el)),delete this.skippable,delete this.itemDuration,delete this.waitPercentage}}),a}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){return'<div class="jw-skip jw-background-color jw-hidden jw-reset">\n    <span class="jw-text jw-skiptext jw-reset"></span>\n    <span class="jw-icon-inline jw-skip-icon jw-reset"></span>\n</div>'},useData:!0})},function(e,t,n){var i,o;i=[n(157)],o=function(e){function t(t,n,i,o){return e({id:t,skin:n,title:i,body:o})}return t}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(120);e.exports=(i["default"]||i).template({compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,n,i){var o,r="function",a=t.helperMissing,s=this.escapeExpression;return'<div id="'+s((o=null!=(o=t.id||(null!=e?e.id:e))?o:a,typeof o===r?o.call(e,{name:"id",hash:{},data:i}):o))+'"class="jw-skin-'+s((o=null!=(o=t.skin||(null!=e?e.skin:e))?o:a,typeof o===r?o.call(e,{name:"skin",hash:{},data:i}):o))+' jw-error jw-reset">\n    <div class="jw-title jw-reset">\n        <div class="jw-title-primary jw-reset">'+s((o=null!=(o=t.title||(null!=e?e.title:e))?o:a,typeof o===r?o.call(e,{name:"title",hash:{},data:i}):o))+'</div>\n        <div class="jw-title-secondary jw-reset">'+s((o=null!=(o=t.body||(null!=e?e.body:e))?o:a,typeof o===r?o.call(e,{name:"body",hash:{},data:i}):o))+'</div>\n    </div>\n\n    <div class="jw-icon-container jw-reset">\n        <div class="jw-display-icon-container jw-background-color jw-reset">\n            <div class="jw-icon jw-icon-display jw-reset"></div>\n        </div>\n    </div>\n</div>\n'},useData:!0})},function(e,t,n){var i,o;i=[],o=function(){function e(){var e=document.createElement("div");return e.className=n,e.innerHTML="&nbsp;",e.style.width="1px",e.style.height="1px",e.style.position="absolute",e.style.background="transparent",e}function t(){function t(){var e=this,t=e._view.element();t.appendChild(r),i()&&e.trigger("adBlock")}function i(){return o?!0:(""!==r.innerHTML&&r.className===n&&null!==r.offsetParent&&0!==r.clientHeight||(o=!0),o)}var o=!1,r=e();return{onReady:t,checkAdBlock:i}}var n="afs_ads";return{setup:t}}.apply(t,i),!(void 0!==o&&(e.exports=o))},,,,function(e,t,n){var i,o;i=[],o=function(){var e=window.chrome,t={};return t.NS="urn:x-cast:com.longtailvideo.jwplayer",t.debug=!1,t.availability=null,t.available=function(n){n=n||t.availability;var i="available";return e&&e.cast&&e.cast.ReceiverAvailability&&(i=e.cast.ReceiverAvailability.AVAILABLE),n===i},t.log=function(){if(t.debug){var e=Array.prototype.slice.call(arguments,0);console.log.apply(console,e)}},t.error=function(){var e=Array.prototype.slice.call(arguments,0);console.error.apply(console,e)},t}.apply(t,i),!(void 0!==o&&(e.exports=o))},,,function(e,t,n){var i,o;i=[n(98),n(45)],o=function(e,t){return function(n,i){var o=["seek","skipAd","stop","playlistNext","playlistPrev","playlistItem","resize","addButton","removeButton","registerPlugin","attachMedia"];t.each(o,function(e){n[e]=function(){return i[e].apply(i,arguments),n}}),n.registerPlugin=e.registerPlugin}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45)],o=function(e){return function(t,n){var i=["buffer","controls","position","duration","fullscreen","volume","mute","item","stretching","playlist"];e.each(i,function(e){var i=e.slice(0,1).toUpperCase()+e.slice(1);t["get"+i]=function(){return n._model.get(e)}});var o=["getAudioTracks","getCaptionsList","getWidth","getHeight","getCurrentAudioTrack","setCurrentAudioTrack","getCurrentCaptions","setCurrentCaptions","getCurrentQuality","setCurrentQuality","getQualityLevels","getVisualQuality","getConfig","getState","getSafeRegion","isBeforeComplete","isBeforePlay","getProvider","detachMedia"],r=["setControls","setFullscreen","setVolume","setMute","setCues"];e.each(o,function(e){t[e]=function(){return n[e]?n[e].apply(n,arguments):null}}),e.each(r,function(e){t[e]=function(){return n[e].apply(n,arguments),t}})}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i,o;i=[n(45),n(46)],o=function(e,t){return function(n){var i={onBufferChange:t.JWPLAYER_MEDIA_BUFFER,onBufferFull:t.JWPLAYER_MEDIA_BUFFER_FULL,onError:t.JWPLAYER_ERROR,onSetupError:t.JWPLAYER_SETUP_ERROR,onFullscreen:t.JWPLAYER_FULLSCREEN,onMeta:t.JWPLAYER_MEDIA_META,onMute:t.JWPLAYER_MEDIA_MUTE,onPlaylist:t.JWPLAYER_PLAYLIST_LOADED,onPlaylistItem:t.JWPLAYER_PLAYLIST_ITEM,onPlaylistComplete:t.JWPLAYER_PLAYLIST_COMPLETE,onReady:t.JWPLAYER_READY,onResize:t.JWPLAYER_RESIZE,onComplete:t.JWPLAYER_MEDIA_COMPLETE,onSeek:t.JWPLAYER_MEDIA_SEEK,onTime:t.JWPLAYER_MEDIA_TIME,onVolume:t.JWPLAYER_MEDIA_VOLUME,onBeforePlay:t.JWPLAYER_MEDIA_BEFOREPLAY,onBeforeComplete:t.JWPLAYER_MEDIA_BEFORECOMPLETE,onDisplayClick:t.JWPLAYER_DISPLAY_CLICK,onControls:t.JWPLAYER_CONTROLS,onQualityLevels:t.JWPLAYER_MEDIA_LEVELS,onQualityChange:t.JWPLAYER_MEDIA_LEVEL_CHANGED,onCaptionsList:t.JWPLAYER_CAPTIONS_LIST,onCaptionsChange:t.JWPLAYER_CAPTIONS_CHANGED,onAdError:t.JWPLAYER_AD_ERROR,onAdClick:t.JWPLAYER_AD_CLICK,onAdImpression:t.JWPLAYER_AD_IMPRESSION,onAdTime:t.JWPLAYER_AD_TIME,onAdComplete:t.JWPLAYER_AD_COMPLETE,onAdCompanions:t.JWPLAYER_AD_COMPANIONS,onAdSkipped:t.JWPLAYER_AD_SKIPPED,onAdPlay:t.JWPLAYER_AD_PLAY,onAdPause:t.JWPLAYER_AD_PAUSE,onAdMeta:t.JWPLAYER_AD_META,onCast:t.JWPLAYER_CAST_SESSION,onAudioTrackChange:t.JWPLAYER_AUDIO_TRACK_CHANGED,onAudioTracks:t.JWPLAYER_AUDIO_TRACKS},o={onBuffer:"buffer",onPause:"pause",onPlay:"play",onIdle:"idle"};e.each(o,function(t,i){n[i]=e.partial(n.on,t,e)}),e.each(i,function(t,i){n[i]=e.partial(n.on,t,e)})}}.apply(t,i),!(void 0!==o&&(e.exports=o))},function(e,t,n){var i=n(169);"string"==typeof i&&(i=[[e.id,i,""]]),n(173)(i,{}),i.locals&&(e.exports=i.locals)},function(e,t,n){t=e.exports=n(170)(),t.push([e.id,".jw-reset{color:inherit;background-color:transparent;padding:0;margin:0;float:none;font-family:Arial,Helvetica,sans-serif;font-size:1em;line-height:1em;list-style:none;text-align:left;text-transform:none;vertical-align:baseline;border:0;direction:ltr;font-variant:inherit;font-stretch:inherit;-webkit-tap-highlight-color:rgba(255,255,255,0)}@font-face{font-family:'jw-icons';src:url("+n(171)+") format('woff'),url("+n(172)+') format(\'truetype\');font-weight:normal;font-style:normal}.jw-icon-inline,.jw-icon-tooltip,.jw-icon-display,.jw-controlbar .jw-menu .jw-option:before{font-family:\'jw-icons\';-webkit-font-smoothing:antialiased;font-style:normal;font-weight:normal;text-transform:none;background-color:transparent;font-variant:normal;-webkit-font-feature-settings:"liga";-ms-font-feature-settings:"liga" 1;-o-font-feature-settings:"liga";font-feature-settings:"liga";-moz-osx-font-smoothing:grayscale}.jw-icon-audio-tracks:before{content:"\\E600"}.jw-icon-buffer:before{content:"\\E601"}.jw-icon-cast:before{content:"\\E603"}.jw-icon-cast.jw-off:before{content:"\\E602"}.jw-icon-cc:before{content:"\\E605"}.jw-icon-cue:before{content:"\\E606"}.jw-icon-menu-bullet:before{content:"\\E606"}.jw-icon-error:before{content:"\\E607"}.jw-icon-fullscreen:before{content:"\\E608"}.jw-icon-fullscreen.jw-off:before{content:"\\E613"}.jw-icon-hd:before{content:"\\E60A"}.jw-watermark:before,.jw-rightclick-logo:before{content:"\\E60B"}.jw-icon-next:before{content:"\\E60C"}.jw-icon-pause:before{content:"\\E60D"}.jw-icon-play:before{content:"\\E60E"}.jw-icon-prev:before{content:"\\E60F"}.jw-icon-replay:before{content:"\\E610"}.jw-icon-volume:before{content:"\\E612"}.jw-icon-volume.jw-off:before{content:"\\E611"}.jw-icon-more:before{content:"\\E614"}.jw-icon-close:before{content:"\\E615"}.jw-icon-playlist:before{content:"\\E616"}.jwplayer{width:100%;font-size:16px;position:relative;display:block;min-height:0;overflow:hidden;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;background-color:#000;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.jwplayer *{box-sizing:inherit}.jwplayer.jw-flag-aspect-mode{height:auto !important}.jwplayer.jw-flag-aspect-mode .jw-aspect{display:block}.jwplayer .jw-aspect{display:none}.jwplayer.jw-no-focus:focus,.jwplayer .jw-swf{outline:none}.jwplayer.jw-ie:focus{outline:#585858 dotted 1px}.jwplayer:hover .jw-display-icon-container{background-color:#333;background:#333;background-size:#333}.jw-media,.jw-preview,.jw-overlays,.jw-controls{position:absolute;width:100%;height:100%;top:0;left:0;bottom:0;right:0}.jw-media{overflow:hidden;cursor:pointer}.jw-overlays{cursor:auto}.jw-media.jw-media-show{visibility:visible;opacity:1}.jw-controls.jw-controls-disabled{display:none}.jw-controls .jw-controls-right{position:absolute;top:0;right:0;left:0;bottom:2em}.jw-text{height:1em;font-family:Arial,Helvetica,sans-serif;font-size:.75em;font-style:normal;font-weight:normal;color:white;text-align:center;font-variant:normal;font-stretch:normal}.jw-plugin{position:absolute;bottom:2.5em}.jw-plugin .jw-banner{max-width:100%;opacity:0;cursor:pointer;position:absolute;margin:auto auto 0 auto;left:0;right:0;bottom:0;display:block}.jw-cast-screen{width:100%;height:100%}.jw-instream{position:absolute;top:0;right:0;bottom:0;left:0;display:none}.jw-icon-playback:before{content:"\\E60E"}.jw-preview,.jw-captions,.jw-title,.jw-overlays,.jw-controls{pointer-events:none}.jw-overlays>div,.jw-media,.jw-controlbar,.jw-dock,.jw-logo,.jw-skip,.jw-display-icon-container{pointer-events:all}.jwplayer video{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;margin:auto;background:transparent}.jwplayer video::-webkit-media-controls-start-playback-button{display:none}.jwplayer video::-webkit-media-text-track-display{-webkit-transform:translateY(-1.5em);transform:translateY(-1.5em)}.jwplayer.jw-flag-user-inactive.jw-state-playing video::-webkit-media-text-track-display{-webkit-transform:translateY(0);transform:translateY(0)}.jwplayer.jw-stretch-uniform video{-o-object-fit:contain;object-fit:contain}.jwplayer.jw-stretch-none video{-o-object-fit:none;object-fit:none}.jwplayer.jw-stretch-fill video{-o-object-fit:cover;object-fit:cover}.jwplayer.jw-stretch-exactfit video{-o-object-fit:fill;object-fit:fill}.jw-click{position:absolute;width:100%;height:100%}.jw-preview{position:absolute;display:none;opacity:1;visibility:visible;width:100%;height:100%;background:#000 no-repeat 50% 50%}.jwplayer .jw-preview,.jw-error .jw-preview,.jw-stretch-uniform .jw-preview{background-size:contain}.jw-stretch-none .jw-preview{background-size:auto auto}.jw-stretch-fill .jw-preview{background-size:cover}.jw-stretch-exactfit .jw-preview{background-size:100% 100%}.jw-display-icon-container{position:relative;top:50%;display:table;height:3.5em;width:3.5em;margin:-1.75em auto 0;cursor:pointer}.jw-display-icon-container .jw-icon-display{position:relative;display:table-cell;text-align:center;vertical-align:middle !important;background-position:50% 50%;background-repeat:no-repeat;font-size:2em}.jw-flag-audio-player .jw-display-icon-container,.jw-flag-dragging .jw-display-icon-container{display:none}.jw-icon{font-family:\'jw-icons\';-webkit-font-smoothing:antialiased;font-style:normal;font-weight:normal;text-transform:none;background-color:transparent;font-variant:normal;-webkit-font-feature-settings:"liga";-ms-font-feature-settings:"liga" 1;-o-font-feature-settings:"liga";font-feature-settings:"liga";-moz-osx-font-smoothing:grayscale}.jw-controlbar{display:table;position:absolute;right:0;left:0;bottom:0;height:2em;padding:0 .25em}.jw-controlbar .jw-hidden{display:none}.jw-controlbar.jw-drawer-expanded .jw-controlbar-left-group,.jw-controlbar.jw-drawer-expanded .jw-controlbar-center-group{opacity:0}.jw-background-color{background-color:#414040}.jw-group{display:table-cell}.jw-controlbar-center-group{width:100%;padding:0 .25em}.jw-controlbar-center-group .jw-slider-time,.jw-controlbar-center-group .jw-text-alt{padding:0}.jw-controlbar-center-group .jw-text-alt{display:none}.jw-controlbar-left-group,.jw-controlbar-right-group{white-space:nowrap}.jw-knob:hover,.jw-icon-inline:hover,.jw-icon-tooltip:hover,.jw-icon-display:hover,.jw-option:before:hover{color:#eee}.jw-icon-inline,.jw-icon-tooltip,.jw-slider-horizontal,.jw-text-elapsed,.jw-text-duration{display:inline-block;height:2em;position:relative;line-height:2em;vertical-align:middle;cursor:pointer}.jw-icon-inline,.jw-icon-tooltip{min-width:1.25em;text-align:center}.jw-icon-playback{min-width:2.25em}.jw-icon-volume{min-width:1.75em;text-align:left}.jw-time-tip{line-height:1em;pointer-events:none}.jw-icon-inline:after,.jw-icon-tooltip:after{width:100%;height:100%;font-size:1em}.jw-icon-cast{display:none}.jw-slider-volume.jw-slider-horizontal,.jw-icon-inline.jw-icon-volume{display:none}.jw-dock{margin:.75em;display:block;opacity:1;clear:right}.jw-dock:after{content:\'\';clear:both;display:block}.jw-dock-button{cursor:pointer;float:right;position:relative;width:2.5em;height:2.5em;margin:.5em}.jw-dock-button .jw-arrow{display:none;position:absolute;bottom:-0.2em;width:.5em;height:.2em;left:50%;margin-left:-0.25em}.jw-dock-button .jw-overlay{display:none;position:absolute;top:2.5em;right:0;margin-top:.25em;padding:.5em;white-space:nowrap}.jw-dock-button:hover .jw-overlay,.jw-dock-button:hover .jw-arrow{display:block}.jw-dock-image{width:100%;height:100%;background-position:50% 50%;background-repeat:no-repeat;opacity:.75}.jw-title{display:none;position:absolute;top:0;width:100%;font-size:.875em;height:8em;background:-webkit-linear-gradient(top, #000 0, #000 18%, rgba(0,0,0,0) 100%);background:linear-gradient(to bottom, #000 0, #000 18%, rgba(0,0,0,0) 100%)}.jw-title-primary,.jw-title-secondary{padding:.75em 1.5em;min-height:2.5em;width:100%;color:white;white-space:nowrap;text-overflow:ellipsis;overflow-x:hidden}.jw-title-primary{font-weight:bold}.jw-title-secondary{margin-top:-0.5em}.jw-slider-container{display:inline-block;height:1em;position:relative;touch-action:none}.jw-rail,.jw-buffer,.jw-progress{position:absolute;cursor:pointer}.jw-progress{background-color:#fff}.jw-rail{background-color:#aaa}.jw-buffer{background-color:#202020}.jw-cue,.jw-knob{position:absolute;cursor:pointer}.jw-cue{background-color:#fff;width:.1em;height:.4em}.jw-knob{background-color:#aaa;width:.4em;height:.4em}.jw-slider-horizontal{width:4em;height:1em}.jw-slider-horizontal.jw-slider-volume{margin-right:5px}.jw-slider-horizontal .jw-rail,.jw-slider-horizontal .jw-buffer,.jw-slider-horizontal .jw-progress{width:100%;height:.4em}.jw-slider-horizontal .jw-progress,.jw-slider-horizontal .jw-buffer{width:0}.jw-slider-horizontal .jw-rail,.jw-slider-horizontal .jw-progress,.jw-slider-horizontal .jw-slider-container{width:100%;}.jw-slider-horizontal .jw-knob{left:0;margin-left:-0.325em}.jw-slider-vertical{width:.75em;height:4em;bottom:0;position:absolute;padding:1em}.jw-slider-vertical .jw-rail,.jw-slider-vertical .jw-buffer,.jw-slider-vertical .jw-progress{bottom:0;height:100%}.jw-slider-vertical .jw-progress,.jw-slider-vertical .jw-buffer{height:0}.jw-slider-vertical .jw-slider-container,.jw-slider-vertical .jw-rail,.jw-slider-vertical .jw-progress{bottom:0;width:.75em;height:100%;left:0;right:0;margin:0 auto}.jw-slider-vertical .jw-slider-container{height:4em;position:relative}.jw-slider-vertical .jw-knob{bottom:0;left:0;right:0;margin:0 auto}.jw-slider-time{right:0;left:0;width:100%}.jw-tooltip-time{position:absolute}.jw-slider-volume .jw-buffer{display:none}.jw-captions{position:absolute;display:none;margin:0 auto;width:100%;left:0;bottom:3em;right:0;max-width:90%;text-align:center}.jw-captions.jw-captions-enabled{display:block}.jw-captions-window{display:none;padding:.25em;border-radius:.25em}.jw-captions-window.jw-captions-window-active{display:inline-block}.jw-captions-text{display:inline-block;color:white;background-color:black;word-wrap:break-word;white-space:pre-line;font-style:normal;font-weight:normal;text-align:center;text-decoration:none;line-height:1.3em;padding:.1em .8em}.jw-rightclick{display:none;position:absolute;white-space:nowrap}.jw-rightclick.jw-open{display:block}.jw-rightclick ul{list-style:none;font-weight:bold;border-radius:.15em;margin:0;border:1px solid #444;padding:0}.jw-rightclick .jw-rightclick-logo{font-size:2em;color:#ff0147;vertical-align:middle;padding-right:.3em;margin-right:.3em;border-right:1px solid #444}.jw-rightclick li{background-color:#000;border-bottom:1px solid #444;margin:0}.jw-rightclick a{color:#fff;text-decoration:none;padding:1em;display:block;font-size:.6875em}.jw-rightclick li:last-child{border-bottom:none}.jw-rightclick li:hover{background-color:#1a1a1a;cursor:pointer}.jw-rightclick .jw-featured{background-color:#252525;vertical-align:middle}.jw-rightclick .jw-featured a{color:#777}.jw-logo{position:absolute;margin:.75em;cursor:pointer;pointer-events:all;background-repeat:no-repeat;background-size:contain;top:auto;right:auto;left:auto;bottom:auto}.jw-logo .jw-flag-audio-player{display:none}.jw-logo-top-right{top:0;right:0}.jw-logo-top-left{top:0;left:0}.jw-logo-bottom-left{bottom:0;left:0}.jw-logo-bottom-right{bottom:0;right:0}.jw-watermark{position:absolute;top:50%;left:0;right:0;bottom:0;text-align:center;font-size:14em;color:#eee;opacity:.33;pointer-events:none}.jw-icon-tooltip.jw-open .jw-overlay{opacity:1;visibility:visible}.jw-icon-tooltip.jw-hidden{display:none}.jw-overlay-horizontal{display:none}.jw-icon-tooltip.jw-open-drawer:before{display:none}.jw-icon-tooltip.jw-open-drawer .jw-overlay-horizontal{opacity:1;display:inline-block;vertical-align:top}.jw-overlay:before{position:absolute;top:0;bottom:0;left:-50%;width:100%;background-color:rgba(0,0,0,0);content:" "}.jw-slider-time .jw-overlay:before{height:1em;top:auto}.jw-time-tip,.jw-volume-tip,.jw-menu{position:relative;left:-50%;border:solid 1px #000;margin:0}.jw-volume-tip{width:100%;height:100%;display:block}.jw-time-tip{text-align:center;font-family:inherit;color:#aaa;bottom:1em;border:solid 4px #000}.jw-time-tip .jw-text{line-height:1em}.jw-controlbar .jw-overlay{margin:0;position:absolute;bottom:2em;left:50%;opacity:0;visibility:hidden}.jw-controlbar .jw-overlay .jw-contents{position:relative}.jw-controlbar .jw-option{position:relative;white-space:nowrap;cursor:pointer;list-style:none;height:1.5em;font-family:inherit;line-height:1.5em;color:#aaa;padding:0 .5em;font-size:.8em}.jw-controlbar .jw-option:hover,.jw-controlbar .jw-option:before:hover{color:#eee}.jw-controlbar .jw-option:before{padding-right:.125em}.jw-playlist-container ::-webkit-scrollbar-track{background-color:#333;border-radius:10px}.jw-playlist-container ::-webkit-scrollbar{width:5px;border:10px solid black;border-bottom:0;border-top:0}.jw-playlist-container ::-webkit-scrollbar-thumb{background-color:white;border-radius:5px}.jw-tooltip-title{border-bottom:1px solid #444;text-align:left;padding-left:.7em}.jw-playlist{max-height:11em;min-height:4.5em;overflow-x:hidden;overflow-y:scroll;width:calc(100% - 4px)}.jw-playlist .jw-option{height:3em;margin-right:5px;color:white;padding-left:1em;font-size:.8em}.jw-playlist .jw-label,.jw-playlist .jw-name{display:inline-block;line-height:3em;text-align:left;overflow:hidden;white-space:nowrap}.jw-playlist .jw-label{width:1em}.jw-playlist .jw-name{width:11em}.jw-skip{cursor:default;position:absolute;float:right;display:inline-block;right:.75em;bottom:3em}.jw-skip.jw-skippable{cursor:pointer}.jw-skip.jw-hidden{visibility:hidden}.jw-skip .jw-skip-icon{display:none;margin-left:-0.75em}.jw-skip .jw-skip-icon:before{content:"\\E60C"}.jw-skip .jw-text,.jw-skip .jw-skip-icon{color:#aaa;vertical-align:middle;line-height:1.5em;font-size:.7em}.jw-skip.jw-skippable:hover{cursor:pointer}.jw-skip.jw-skippable:hover .jw-text,.jw-skip.jw-skippable:hover .jw-skip-icon{color:#eee}.jw-skip.jw-skippable .jw-skip-icon{display:inline;margin:0}.jwplayer.jw-state-playing.jw-flag-casting .jw-display-icon-container,.jwplayer.jw-state-paused.jw-flag-casting .jw-display-icon-container{display:table}.jwplayer.jw-flag-casting .jw-display-icon-container{border-radius:0;border:1px solid white;position:absolute;top:auto;left:.5em;right:.5em;bottom:50%;margin-bottom:-12.5%;height:50%;width:50%;padding:0;background-repeat:no-repeat;background-position:center}.jwplayer.jw-flag-casting .jw-display-icon-container .jw-icon{font-size:3em}.jwplayer.jw-flag-casting.jw-state-complete .jw-preview{display:none}.jw-cast{position:absolute;width:100%;height:100%;background-repeat:no-repeat;background-size:auto;background-position:50% 50%}.jw-cast-label{position:absolute;left:.5em;right:.5em;bottom:75%;margin-bottom:1.5em;text-align:center}.jw-cast-name{color:#ccc}.jw-state-idle .jw-preview{display:block}.jw-state-idle .jw-icon-display:before{content:"\\E60E"}.jw-state-idle .jw-controlbar{display:none}.jw-state-idle .jw-captions{display:none}.jw-state-idle .jw-title{display:block}.jwplayer.jw-state-playing .jw-display-icon-container{display:none}.jwplayer.jw-state-playing .jw-display-icon-container .jw-icon-display:before{content:"\\E60D"}.jwplayer.jw-state-playing .jw-icon-playback:before{content:"\\E60D"}.jwplayer.jw-state-paused .jw-display-icon-container{display:none}.jwplayer.jw-state-paused .jw-display-icon-container .jw-icon-display:before{content:"\\E60E"}.jwplayer.jw-state-paused .jw-icon-playback:before{content:"\\E60E"}.jwplayer.jw-state-buffering .jw-display-icon-container .jw-icon-display{-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}.jwplayer.jw-state-buffering .jw-display-icon-container .jw-icon-display:before{content:"\\E601"}@-webkit-keyframes spin{100%{-webkit-transform:rotate(360deg)}}@keyframes spin{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.jwplayer.jw-state-buffering .jw-display-icon-container .jw-text{display:none}.jwplayer.jw-state-buffering .jw-icon-playback:before{content:"\\E60D"}.jwplayer.jw-state-complete .jw-preview{display:block}.jwplayer.jw-state-complete .jw-display-icon-container .jw-icon-display:before{content:"\\E610"}.jwplayer.jw-state-complete .jw-display-icon-container .jw-text{display:none}.jwplayer.jw-state-complete .jw-icon-playback:before{content:"\\E60E"}.jwplayer.jw-state-complete .jw-captions{display:none}body .jw-error .jw-title,.jwplayer.jw-state-error .jw-title{display:block}body .jw-error .jw-title .jw-title-primary,.jwplayer.jw-state-error .jw-title .jw-title-primary{white-space:normal}body .jw-error .jw-preview,.jwplayer.jw-state-error .jw-preview{display:block}body .jw-error .jw-controlbar,.jwplayer.jw-state-error .jw-controlbar{display:none}body .jw-error .jw-captions,.jwplayer.jw-state-error .jw-captions{display:none}body .jw-error:hover .jw-display-icon-container,.jwplayer.jw-state-error:hover .jw-display-icon-container{cursor:default;color:#fff;background:#000}body .jw-error .jw-icon-display,.jwplayer.jw-state-error .jw-icon-display{cursor:default;font-family:\'jw-icons\';-webkit-font-smoothing:antialiased;font-style:normal;font-weight:normal;text-transform:none;background-color:transparent;font-variant:normal;-webkit-font-feature-settings:"liga";-ms-font-feature-settings:"liga" 1;-o-font-feature-settings:"liga";font-feature-settings:"liga";-moz-osx-font-smoothing:grayscale}body .jw-error .jw-icon-display:before,.jwplayer.jw-state-error .jw-icon-display:before{content:"\\E607"}body .jw-error .jw-icon-display:hover,.jwplayer.jw-state-error .jw-icon-display:hover{color:#fff}body .jw-error{font-size:16px;background-color:#000;color:#eee;width:100%;height:100%;display:table;opacity:1;position:relative}body .jw-error .jw-icon-container{position:absolute;width:100%;height:100%;top:0;left:0;bottom:0;right:0}.jwplayer.jw-flag-cast-available .jw-controlbar{display:table}.jwplayer.jw-flag-cast-available .jw-icon-cast{display:inline-block}.jwplayer.jw-flag-skin-loading .jw-captions,.jwplayer.jw-flag-skin-loading .jw-controls,.jwplayer.jw-flag-skin-loading .jw-title{display:none}.jwplayer.jw-flag-fullscreen{width:100% !important;height:100% !important;top:0;right:0;bottom:0;left:0;z-index:1000;margin:0;position:fixed}.jwplayer.jw-flag-fullscreen.jw-flag-user-inactive{cursor:none;-webkit-cursor-visibility:auto-hide}.jwplayer.jw-flag-live .jw-controlbar .jw-text-elapsed,.jwplayer.jw-flag-live .jw-controlbar .jw-text-duration,.jwplayer.jw-flag-live .jw-controlbar .jw-slider-time{display:none}.jwplayer.jw-flag-live .jw-controlbar .jw-text-alt{display:inline}.jwplayer.jw-flag-user-inactive.jw-state-playing .jw-controlbar,.jwplayer.jw-flag-user-inactive.jw-state-playing .jw-dock{display:none}.jwplayer.jw-flag-user-inactive.jw-state-playing .jw-logo.jw-hide{display:none}.jwplayer.jw-flag-user-inactive.jw-state-playing .jw-plugin,.jwplayer.jw-flag-user-inactive.jw-state-playing .jw-captions{bottom:.5em}.jwplayer.jw-flag-user-inactive.jw-state-buffering .jw-controlbar{display:none}.jwplayer.jw-flag-media-audio .jw-controlbar{display:table}.jwplayer.jw-flag-media-audio.jw-flag-user-inactive .jw-controlbar{display:table}.jwplayer.jw-flag-media-audio.jw-flag-user-inactive.jw-state-playing .jw-plugin,.jwplayer.jw-flag-media-audio.jw-flag-user-inactive.jw-state-playing .jw-captions{bottom:3em}.jw-flag-media-audio .jw-preview{display:block}.jwplayer.jw-flag-ads .jw-preview,.jwplayer.jw-flag-ads .jw-dock{display:none}.jwplayer.jw-flag-ads .jw-controlbar .jw-icon-inline,.jwplayer.jw-flag-ads .jw-controlbar .jw-icon-tooltip,.jwplayer.jw-flag-ads .jw-controlbar .jw-text,.jwplayer.jw-flag-ads .jw-controlbar .jw-slider-horizontal{display:none}.jwplayer.jw-flag-ads .jw-controlbar .jw-icon-playback,.jwplayer.jw-flag-ads .jw-controlbar .jw-icon-volume,.jwplayer.jw-flag-ads .jw-controlbar .jw-slider-volume,.jwplayer.jw-flag-ads .jw-controlbar .jw-icon-fullscreen{display:inline-block}.jwplayer.jw-flag-ads .jw-controlbar .jw-text-alt{display:inline}.jwplayer.jw-flag-ads .jw-controlbar .jw-slider-volume.jw-slider-horizontal,.jwplayer.jw-flag-ads .jw-controlbar .jw-icon-inline.jw-icon-volume{display:inline-block}.jwplayer.jw-flag-ads .jw-controlbar .jw-icon-tooltip.jw-icon-volume{display:none}.jwplayer.jw-flag-ads .jw-logo,.jwplayer.jw-flag-ads .jw-captions{display:none}.jwplayer.jw-flag-ads-googleima .jw-controlbar{display:table;bottom:0}.jwplayer.jw-flag-ads-googleima.jw-flag-touch .jw-controlbar{font-size:1em}.jwplayer.jw-flag-ads-googleima.jw-flag-touch.jw-state-paused .jw-display-icon-container{display:none}.jwplayer.jw-flag-ads-googleima.jw-skin-seven .jw-controlbar{font-size:.9em}.jwplayer.jw-flag-ads-vpaid .jw-controlbar{display:none}.jwplayer.jw-flag-ads-hide-controls .jw-controls{display:none !important}.jwplayer.jw-flag-ads.jw-flag-touch .jw-controlbar{display:table}.jwplayer.jw-flag-overlay-open .jw-title{display:none}.jwplayer.jw-flag-overlay-open .jw-controls-right .jw-logo{display:none}.jwplayer.jw-flag-overlay-open-sharing .jw-controls,.jwplayer.jw-flag-overlay-open-related .jw-controls,.jwplayer.jw-flag-overlay-open-sharing .jw-title,.jwplayer.jw-flag-overlay-open-related .jw-title{display:none}.jwplayer.jw-flag-rightclick-open{overflow:visible}.jwplayer.jw-flag-rightclick-open .jw-rightclick{z-index:16777215}.jw-flag-controls-disabled .jw-controls{visibility:hidden}.jw-flag-controls-disabled .jw-logo{visibility:visible}.jw-flag-controls-disabled .jw-media{cursor:auto}body .jwplayer.jw-flag-flash-blocked .jw-title{display:block}body .jwplayer.jw-flag-flash-blocked .jw-controls,body .jwplayer.jw-flag-flash-blocked .jw-overlays,body .jwplayer.jw-flag-flash-blocked .jw-preview{display:none}.jw-flag-touch .jw-controlbar,.jw-flag-touch .jw-skip,.jw-flag-touch .jw-plugin{font-size:1.5em}.jw-flag-touch .jw-captions{bottom:4.25em}.jw-flag-touch .jw-icon-tooltip.jw-open-drawer:before{display:inline}.jw-flag-touch .jw-icon-tooltip.jw-open-drawer:before{content:"\\E615"}.jw-flag-touch .jw-display-icon-container{pointer-events:none}.jw-flag-touch.jw-state-paused .jw-display-icon-container{display:table}.jw-flag-touch.jw-state-paused.jw-flag-dragging .jw-display-icon-container{display:none}.jw-flag-compact-player .jw-icon-playlist,.jw-flag-compact-player .jw-text-elapsed,.jw-flag-compact-player .jw-text-duration{display:none}.jwplayer.jw-flag-audio-player{background-color:transparent}.jwplayer.jw-flag-audio-player .jw-media{visibility:hidden}.jwplayer.jw-flag-audio-player .jw-media object{width:1px;height:1px}.jwplayer.jw-flag-audio-player .jw-preview,.jwplayer.jw-flag-audio-player .jw-display-icon-container{display:none}.jwplayer.jw-flag-audio-player .jw-controlbar{display:table;height:auto;left:0;bottom:0;margin:0;width:100%;min-width:100%;opacity:1}.jwplayer.jw-flag-audio-player .jw-controlbar .jw-icon-fullscreen,.jwplayer.jw-flag-audio-player .jw-controlbar .jw-icon-tooltip{display:none}.jwplayer.jw-flag-audio-player .jw-controlbar .jw-slider-volume.jw-slider-horizontal,.jwplayer.jw-flag-audio-player .jw-controlbar .jw-icon-inline.jw-icon-volume{display:inline-block}.jwplayer.jw-flag-audio-player .jw-controlbar .jw-icon-tooltip.jw-icon-volume{display:none}.jwplayer.jw-flag-audio-player.jw-flag-user-inactive .jw-controlbar{display:table}.jw-skin-seven .jw-background-color{background:#000}.jw-skin-seven .jw-controlbar{border-top:#333 1px solid;height:2.5em}.jw-skin-seven .jw-group{vertical-align:middle}.jw-skin-seven .jw-playlist{background-color:rgba(0,0,0,0.5)}.jw-skin-seven .jw-playlist-container{left:-43%;background-color:rgba(0,0,0,0.5)}.jw-skin-seven .jw-playlist-container .jw-option{border-bottom:1px solid #444}.jw-skin-seven .jw-playlist-container .jw-option:hover,.jw-skin-seven .jw-playlist-container .jw-option.jw-active-option{background-color:black}.jw-skin-seven .jw-playlist-container .jw-option:hover .jw-label{color:#FF0046}.jw-skin-seven .jw-playlist-container .jw-icon-playlist{margin-left:0}.jw-skin-seven .jw-playlist-container .jw-label .jw-icon-play{color:#FF0046}.jw-skin-seven .jw-playlist-container .jw-label .jw-icon-play:before{padding-left:0}.jw-skin-seven .jw-tooltip-title{background-color:#000;color:#fff}.jw-skin-seven .jw-text{color:#fff}.jw-skin-seven .jw-button-color{color:#fff}.jw-skin-seven .jw-button-color:hover{color:#FF0046}.jw-skin-seven .jw-toggle{color:#FF0046}.jw-skin-seven .jw-toggle.jw-off{color:#fff}.jw-skin-seven .jw-controlbar .jw-icon:before,.jw-skin-seven .jw-text-elapsed,.jw-skin-seven .jw-text-duration{padding:0 .7em}.jw-skin-seven .jw-controlbar .jw-icon-prev:before{padding-right:.25em}.jw-skin-seven .jw-controlbar .jw-icon-playlist:before{padding:0 .45em}.jw-skin-seven .jw-controlbar .jw-icon-next:before{padding-left:.25em}.jw-skin-seven .jw-icon-prev,.jw-skin-seven .jw-icon-next{font-size:.7em}.jw-skin-seven .jw-icon-prev:before{border-left:1px solid #666}.jw-skin-seven .jw-icon-next:before{border-right:1px solid #666}.jw-skin-seven .jw-icon-display{color:#fff}.jw-skin-seven .jw-icon-display:before{padding-left:0}.jw-skin-seven .jw-display-icon-container{border-radius:50%;border:1px solid #333}.jw-skin-seven .jw-rail{background-color:#384154;box-shadow:none}.jw-skin-seven .jw-buffer{background-color:#666F82}.jw-skin-seven .jw-progress{background:#FF0046}.jw-skin-seven .jw-knob{width:.6em;height:.6em;background-color:#fff;box-shadow:0 0 0 1px #000;border-radius:1em}.jw-skin-seven .jw-slider-horizontal .jw-slider-container{height:.95em}.jw-skin-seven .jw-slider-horizontal .jw-rail,.jw-skin-seven .jw-slider-horizontal .jw-buffer,.jw-skin-seven .jw-slider-horizontal .jw-progress{height:.2em;border-radius:0}.jw-skin-seven .jw-slider-horizontal .jw-knob{top:-0.2em}.jw-skin-seven .jw-slider-horizontal .jw-cue{top:-0.05em;width:.3em;height:.3em;background-color:#fff;border-radius:50%}.jw-skin-seven .jw-slider-vertical .jw-rail,.jw-skin-seven .jw-slider-vertical .jw-buffer,.jw-skin-seven .jw-slider-vertical .jw-progress{width:.2em}.jw-skin-seven .jw-slider-vertical .jw-knob{margin-bottom:-0.3em}.jw-skin-seven .jw-volume-tip{width:100%;left:-45%;padding-bottom:.7em}.jw-skin-seven .jw-text-duration{color:#666F82}.jw-skin-seven .jw-controlbar-right-group .jw-icon-tooltip:before,.jw-skin-seven .jw-controlbar-right-group .jw-icon-inline:before{border-left:1px solid #666}.jw-skin-seven .jw-controlbar-right-group .jw-icon-inline:first-child:before{border:none}.jw-skin-seven .jw-dock .jw-dock-button{border-radius:50%;border:1px solid #333}.jw-skin-seven .jw-dock .jw-overlay{border-radius:2.5em}.jw-skin-seven .jw-icon-tooltip .jw-active-option{background-color:#FF0046;color:#fff}.jw-skin-seven .jw-icon-volume{min-width:2.6em}.jw-skin-seven .jw-time-tip,.jw-skin-seven .jw-menu,.jw-skin-seven .jw-volume-tip,.jw-skin-seven .jw-skip{border:1px solid #333}.jw-skin-seven .jw-time-tip{padding:.2em;bottom:1.3em}.jw-skin-seven .jw-menu,.jw-skin-seven .jw-volume-tip{bottom:.24em}.jw-skin-seven .jw-skip{padding:.4em;border-radius:1.75em}.jw-skin-seven .jw-skip .jw-text,.jw-skin-seven .jw-skip .jw-icon-inline{color:#fff;line-height:1.75em}.jw-skin-seven .jw-skip.jw-skippable:hover .jw-text,.jw-skin-seven .jw-skip.jw-skippable:hover .jw-icon-inline{color:#FF0046}.jw-skin-seven.jw-flag-touch .jw-controlbar .jw-icon:before,.jw-skin-seven.jw-flag-touch .jw-text-elapsed,.jw-skin-seven.jw-flag-touch .jw-text-duration{padding:0 .35em}.jw-skin-seven.jw-flag-touch .jw-controlbar .jw-icon-prev:before{padding:0 .125em 0 .7em}.jw-skin-seven.jw-flag-touch .jw-controlbar .jw-icon-next:before{padding:0 .7em 0 .125em}.jw-skin-seven.jw-flag-touch .jw-controlbar .jw-icon-playlist:before{padding:0 .225em}',""]);
      },function(e,t){e.exports=function(){var e=[];return e.toString=function(){for(var e=[],t=0;t<this.length;t++){var n=this[t];n[2]?e.push("@media "+n[2]+"{"+n[1]+"}"):e.push(n[1])}return e.join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var i={},o=0;o<this.length;o++){var r=this[o][0];"number"==typeof r&&(i[r]=!0)}for(o=0;o<t.length;o++){var a=t[o];"number"==typeof a[0]&&i[a[0]]||(n&&!a[2]?a[2]=n:n&&(a[2]="("+a[2]+") and ("+n+")"),e.push(a))}},e}},function(e,t){e.exports="data:application/font-woff;base64,d09GRgABAAAAABQ4AAsAAAAAE+wAAQABAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABCAAAAGAAAABgDxID2WNtYXAAAAFoAAAAVAAAAFQaVsydZ2FzcAAAAbwAAAAIAAAACAAAABBnbHlmAAABxAAAD3AAAA9wKJaoQ2hlYWQAABE0AAAANgAAADYIhqKNaGhlYQAAEWwAAAAkAAAAJAmCBdxobXR4AAARkAAAAGwAAABscmAHPWxvY2EAABH8AAAAOAAAADg2EDnwbWF4cAAAEjQAAAAgAAAAIAAiANFuYW1lAAASVAAAAcIAAAHCwZOZtHBvc3QAABQYAAAAIAAAACAAAwAAAAMEmQGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA5hYDwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADgAAAAKAAgAAgACAAEAIOYW//3//wAAAAAAIOYA//3//wAB/+MaBAADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAABABgAAAFoAOAADoAPwBEAEkAACUVIi4CNTQ2Ny4BNTQ+AjMyHgIVFAYHHgEVFA4CIxEyFhc+ATU0LgIjIg4CFRQWFz4BMxExARUhNSEXFSE1IRcVITUhAUAuUj0jCgoKCkZ6o11do3pGCgoKCiM9Ui4qSh4BAjpmiE1NiGY6AQIeSioCVQIL/fWWAXX+i0oBK/7VHh4jPVIuGS4VH0MiXaN6RkZ6o10iQx8VLhkuUj0jAcAdGQ0bDk2IZjo6ZohNDhsNGR3+XgNilZXglZXglZUAAAABAEAAAAPAA4AAIQAAExQeAjMyPgI1MxQOAiMiLgI1ND4CMxUiDgIVMYs6ZohNTYhmOktGeqNdXaN6RkZ6o11NiGY6AcBNiGY6OmaITV2jekZGeqNdXaN6Rks6ZohNAAAEAEAAAATAA4AADgAcACoAMQAAJS4BJyERIREuAScRIREhByMuAyc1HgMXMSsBLgMnNR4DFzErATUeARcxAn8DBQQCDPxGCysLBDz9v1NaCERrjE9irINTCLVbByc6Sio9a1I1CLaBL0YMQgsoCgLB/ukDCgIBSPzCQk6HaEIIWAhQgKdgKUg5JgdYBzRRZzx9C0QuAAAAAAUAQAAABMADgAAOABkAJwA1ADwAACUuASchESERLgEnESERIQE1IREhLgMnMQEjLgMnNR4DFzErAS4DJzUeAxcxKwE1HgEXMQKAAgYFAg38QAwqCgRA/cD+gANA/iAYRVlsPgEtWghFa4xPYq2DUgmzWgcnO0oqPGpSNgm6gDBEDEAMKAwCwP7tAggDAUb8wAHQ8P3APWdUQRf98E2IaEIHWghQgKhgKUg4JgdaCDVRZzt9DEMuAAAEAEAAAAXAA4AABAAJAGcAxQAANxEhESEBIREhEQU+ATc+ATMyFhceARceARceARcjLgEnLgEnLgEnLgEjIgYHDgEHDgEHDgEVFBYXHgEXHgEXHgEzMjY3PgE3Mw4BBw4BBw4BBw4BIyImJy4BJy4BJy4BNTQ2Nz4BNzEhPgE3PgEzMhYXHgEXHgEXHgEXIy4BJy4BJy4BJy4BIyIGBw4BBw4BBw4BFRQWFx4BFx4BFx4BMzI2Nz4BNzMOAQcOAQcOAQcOASMiJicuAScuAScuATU0Njc+ATcxQAWA+oAFNvsUBOz8Iw4hExQsGBIhEA8cDQwUCAgLAlsBBQUECgYHDggIEAkQGgsLEgcHCgMDAwMDAwoHBxILCxoQFiEMDA8DWgIJBwgTDQwcERAkFBgsFBMhDg0VBwcHBwcHFQ0Bug0hFBMsGREhEBAcDAwVCAgKAloCBQQECwYGDggIEQgQGwsLEgcHCgMDAwMDAwoHBxILCxsQFSIMDA4DWwIJCAcUDAwdEBEkExksExQhDQ4UBwcICAcHFA4AA4D8gAM1/RYC6tcQGAgJCQUFBQ8KChgPDiETCQ4HBwwFBQgDAwIGBgYRCgoYDQ0cDg0aDQ0XCgoRBgYGDQ0OIhYUJBEQHAsLEgYGBgkICRcPDyQUFCwXGC0VFCQPEBgICQkFBQUPCgoYDw4hEwkOBwcMBQUIAwMCBgYGEQoKGA0NHA4NGg0NFwoKEQYGBg0NDiIWFCQREBwLCxIGBgYJCAkXDw8kFBQsFxgtFRQkDwAAAAADAEAAAAXAA4AAEABvAM4AACUhIiY1ETQ2MyEyFhURFAYjAT4BNz4BNz4BMzIWFx4BFx4BFx4BFzMuAScuAScuAScuASMiBgcOAQcOAQcOARUUFhceARceARceATMyNjc+ATc+ATc+ATcjDgEHDgEjIiYnLgEnLgEnLgE1NDY3OQEhPgE3PgE3PgEzMhYXHgEXHgEXHgEXMy4BJy4BJy4BJy4BIyIGBw4BBw4BBw4BFRQWFx4BFx4BFx4BMzI2Nz4BNz4BNz4BNyMOAQcOASMiJicuAScuAScuATU0Njc5AQUs+6g9V1c9BFg9V1c9/JoDCgcGEgsLGxAJEAgIDgYHCgQEBgFaAgoICBQNDBwQDyESGCwUEyEODRUHBwcHBwcVDQ4hExQrGRQkEBAdDAwUCAcJAloDDwwMIhUQGwsLEgYHCgMEAwMEAbkDCgcHEgsLGxAIEQgHDwYGCwQEBQFbAgoICBUMDBwQECERGSwTFCENDhQHBwgIBwcUDg0hFBMsGRMkERAdDAwUBwgJAlsDDgwNIRUQGwsLEgcHCgMDAwMDAFc+AlY+V1c+/ao+VwH0DRgKCxAGBgYCAwMIBQUMBwcOCRMhDg8YCgoOBgUFCQkIGBAPJBQVLRgXLBQUJA8PFwkICQYGBhILCxwQESQUFiIODQ0GBgYRCgoXDQ0aDg4bDQ0YCgsQBgYGAgMDCAUFDAcHDgkTIQ4PGAoKDgYFBQkJCBgQDyQUFS0YFywUFCQPDxcJCAkGBgYSCwscEBEkFBYiDg0NBgYGEQoKFw0NGg4OGw0AAAABAOAAoAMgAuAAFAAAARQOAiMiLgI1ND4CMzIeAhUDIC1OaTw8aU4tLU5pPDxpTi0BwDxpTi0tTmk8PGlOLS1OaTwAAAMAQAAQBEADkAADABAAHwAANwkBISUyNjU0JiMiBhUUFjMTNCYjIgYVERQWMzI2NRFAAgACAPwAAgAOFRUODhUVDiMVDg4VFQ4OFRADgPyAcBYQDxgWERAWAeYPGBYR/tcPGBYRASkAAgBAAAADwAOAAAcADwAANxEXNxcHFyEBIREnByc3J0CAsI2wgP5zAfMBjYCwjbCAAAGNgLCNsIADgP5zgLCNsIAAAAAFAEAAAAXAA4AABAAJABYAMwBPAAA3ESERIQEhESERATM1MxEjNSMVIxEzFSUeARceARceARUUBgcOAQcOAQcOASsBETMeARcxBxEzMjY3PgE3PgE3PgE1NCYnLgEnLgEnLgErAUAFgPqABTb7FATs/FS2YGC2ZGQCXBQeDg8UBwcJBgcHEwwMIRMTLBuwsBYqE6BHCRcJChIIBw0FBQUEAwINBwcTDAwgETcAA4D8gAM2/RcC6f7Arf5AwMABwK2dBxQODyIWFTAbGC4TFiIPDhgKCQcBwAIHB0P+5gQDAg0HBxcMDCETER0PDhgKCQ8EBQUABAA9AAAFwAOAABAAHQA7AFkAACUhIiY1ETQ2MyEyFhURFAYjASMVIzUjETM1MxUzEQUuAScuAScuASsBETMyNjc+ATc+ATc+ATUuASc5AQcOAQcOASsBETMyFhceARceARceARUUBgcOAQc5AQUq+6k+WFg+BFc+WFg+/bNgs2Rks2ABsAcXDA4fExMnFrCwGywTEx4PDBMHBwYCCAl3CBIKCRQMRzcTHgwMEwcHCwQDBAUFBQ0HAFg+AlQ+WFg+/aw+WAKdra3+QMDAAcB9FiIODxQHBwb+QAkHCRgPDiUTFiwYHTAW4ggNAgMEAR8EBQUPCgoYDw4fERMfDwwXBwAAAAABAEMABgOgA3oAjwAAExQiNScwJic0JicuAQcOARUcARUeARceATc+ATc+ATE2MhUwFAcUFhceARceATMyNjc+ATc+ATc+AzE2MhUwDgIVFBYXHgEXFjY3PgE3PgE3PgE3PgM3PAE1NCYnJgYHDgMxBiI1MDwCNTQmJyYGBw4BBw4DMQYiNTAmJy4BJyYGBw4BMRWQBgQIBAgCBQ4KBwkDFgcHIQ8QDwcHNgUEAwMHBQsJChcMBQ0FBwsHDBMICR8cFQUFAwQDCAUHFRERJBEMEwgJEgUOGQwGMjgvBAkHDBYEAz1IPAQFLyQRIhEQFgoGIiUcBQUEAgMYKCcmCgcsAboFBQwYDwUKBwUEAgMNBwcLBxRrDhENBwggDxOTCgqdMBM1EQwTCAcFBAIFCgcPIw4UQ0IxCgpTc3glEyMREBgIBwEKBxUKESUQJ00mE6/JrA8FBgIHDQMECAkGla2PCQk1VGYxNTsHAgUKChwQC2BqVQoKehYfTwUDRx8TkAMAAAAAAgBGAAAENgOAAAQACAAAJREzESMJAhEDxnBw/IADgPyAAAOA/IADgP5A/kADgAAAAgCAAAADgAOAAAQACQAAJREhESEBIREhEQKAAQD/AP4AAQD/AAADgPyAA4D8gAOAAAAAAAEAgAAABAADgAADAAAJAREBBAD8gAOAAcD+QAOA/kAAAgBKAAAEOgOAAAQACAAANxEjETMJAhG6cHADgPyAA4AAA4D8gAOA/kD+QAOAAAAAAQBDACADQwOgACkAAAEeARUUDgIjIi4CNTQ+AjM1DQE1Ig4CFRQeAjMyPgI1NCYnNwMNGhw8aYxPT4xoPT1ojE8BQP7APGlOLS1OaTw8aU4tFhNTAmMrYzVPjGg9PWiMT0+MaD2ArbOALU5pPDxpTi0tTmk8KUsfMAAAAAEAQABmAiADEwAGAAATETMlESUjQM0BE/7tzQEzARPN/VPNAAQAQAAABJADgAAXACsAOgBBAAAlJz4DNTQuAic3HgMVFA4CBzEvAT4BNTQmJzceAxUOAwcxJz4BNTQmJzceARUUBgcnBREzJRElIwPaKiY+KxcXKz4mKipDMBkZMEMqpCk5REQ5KSE0JBQBFCQzIcMiKCgiKiYwMCYq/c3NARP+7c0AIyheaXI8PHFpXikjK2ZyfEFBfHJmK4MjNZFUVJE1Ix5IUFgvL1lRRx2zFkgpK0YVIxxcNDVZHykDARPN/VPNAAACAEAAAAPDA4AABwAPAAABFyERFzcXBwEHJzcnIREnAypw/qlwl3mZ/iaWepZwAVdtAnNwAVdwlnqT/iOWepZw/qpsAAMAQAETBcACYAAMABkAJgAAARQGIyImNTQ2MzIWFSEUBiMiJjU0NjMyFhUhFAYjIiY1NDYzMhYVAY1iRUVhYUVFYgIWYUVFYmJFRWECHWFFRWJiRUVhAbpFYmJFRWFhRUViYkVFYWFFRWJiRUVhYUUAAAAAAQBmACYDmgNaACAAAAEXFhQHBiIvAQcGIicmND8BJyY0NzYyHwE3NjIXFhQPAQKj9yQkJGMd9vYkYx0kJPf3JCQkYx329iRjHSQk9wHA9iRjHSQk9/ckJCRjHfb2JGMdJCT39yQkJGMd9gAABgBEAAQDvAN8AAQACQAOABMAGAAdAAABIRUhNREhFSE1ESEVITUBMxUjNREzFSM1ETMVIzUBpwIV/esCFf3rAhX96/6dsrKysrKyA3xZWf6dWVn+nVlZAsaysv6dsrL+nbKyAAEAAAABGZqh06s/Xw889QALBAAAAAAA0dQiKwAAAADR1CIrAAAAAAXAA6AAAAAIAAIAAAAAAAAAAQAAA8D/wAAABgAAAAAABcAAAQAAAAAAAAAAAAAAAAAAABsEAAAAAAAAAAAAAAACAAAABgAAYAQAAEAFAABABQAAQAYAAEAGAABABAAA4ASAAEAEAABABgAAQAYAAD0D4ABDBIAARgQAAIAEAACABIAASgOAAEMEwABABMAAQAQAAEAGAABABAAAZgQAAEQAAAAAAAoAFAAeAIgAuAEEAWAChgOyA9QECAQqBKQFJgXoBgAGGgYqBkIGgAaSBvQHFgdQB4YHuAABAAAAGwDPAAYAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEADAAAAAEAAAAAAAIABwCNAAEAAAAAAAMADABFAAEAAAAAAAQADACiAAEAAAAAAAUACwAkAAEAAAAAAAYADABpAAEAAAAAAAoAGgDGAAMAAQQJAAEAGAAMAAMAAQQJAAIADgCUAAMAAQQJAAMAGABRAAMAAQQJAAQAGACuAAMAAQQJAAUAFgAvAAMAAQQJAAYAGAB1AAMAAQQJAAoANADganctc2l4LWljb25zAGoAdwAtAHMAaQB4AC0AaQBjAG8AbgBzVmVyc2lvbiAxLjEAVgBlAHIAcwBpAG8AbgAgADEALgAxanctc2l4LWljb25zAGoAdwAtAHMAaQB4AC0AaQBjAG8AbgBzanctc2l4LWljb25zAGoAdwAtAHMAaQB4AC0AaQBjAG8AbgBzUmVndWxhcgBSAGUAZwB1AGwAYQByanctc2l4LWljb25zAGoAdwAtAHMAaQB4AC0AaQBjAG8AbgBzRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="},function(e,t){e.exports="data:application/octet-stream;base64,AAEAAAALAIAAAwAwT1MvMg8SA9kAAAC8AAAAYGNtYXAaVsydAAABHAAAAFRnYXNwAAAAEAAAAXAAAAAIZ2x5ZiiWqEMAAAF4AAAPcGhlYWQIhqKNAAAQ6AAAADZoaGVhCYIF3AAAESAAAAAkaG10eHJgBz0AABFEAAAAbGxvY2E2EDnwAAARsAAAADhtYXhwACIA0QAAEegAAAAgbmFtZcGTmbQAABIIAAABwnBvc3QAAwAAAAATzAAAACAAAwSZAZAABQAAApkCzAAAAI8CmQLMAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADmFgPA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAAAAAADAAAAAwAAABwAAQADAAAAHAADAAEAAAAcAAQAOAAAAAoACAACAAIAAQAg5hb//f//AAAAAAAg5gD//f//AAH/4xoEAAMAAQAAAAAAAAAAAAAAAQAB//8ADwABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAAEAGAAAAWgA4AAOgA/AEQASQAAJRUiLgI1NDY3LgE1ND4CMzIeAhUUBgceARUUDgIjETIWFz4BNTQuAiMiDgIVFBYXPgEzETEBFSE1IRcVITUhFxUhNSEBQC5SPSMKCgoKRnqjXV2jekYKCgoKIz1SLipKHgECOmaITU2IZjoBAh5KKgJVAgv99ZYBdf6LSgEr/tUeHiM9Ui4ZLhUfQyJdo3pGRnqjXSJDHxUuGS5SPSMBwB0ZDRsOTYhmOjpmiE0OGw0ZHf5eA2KVleCVleCVlQAAAAEAQAAAA8ADgAAhAAATFB4CMzI+AjUzFA4CIyIuAjU0PgIzFSIOAhUxizpmiE1NiGY6S0Z6o11do3pGRnqjXU2IZjoBwE2IZjo6ZohNXaN6RkZ6o11do3pGSzpmiE0AAAQAQAAABMADgAAOABwAKgAxAAAlLgEnIREhES4BJxEhESEHIy4DJzUeAxcxKwEuAyc1HgMXMSsBNR4BFzECfwMFBAIM/EYLKwsEPP2/U1oIRGuMT2Ksg1MItVsHJzpKKj1rUjUItoEvRgxCCygKAsH+6QMKAgFI/MJCTodoQghYCFCAp2ApSDkmB1gHNFFnPH0LRC4AAAAABQBAAAAEwAOAAA4AGQAnADUAPAAAJS4BJyERIREuAScRIREhATUhESEuAycxASMuAyc1HgMXMSsBLgMnNR4DFzErATUeARcxAoACBgUCDfxADCoKBED9wP6AA0D+IBhFWWw+AS1aCEVrjE9irYNSCbNaByc7Sio8alI2CbqAMEQMQAwoDALA/u0CCAMBRvzAAdDw/cA9Z1RBF/3wTYhoQgdaCFCAqGApSDgmB1oINVFnO30MQy4AAAQAQAAABcADgAAEAAkAZwDFAAA3ESERIQEhESERBT4BNz4BMzIWFx4BFx4BFx4BFyMuAScuAScuAScuASMiBgcOAQcOAQcOARUUFhceARceARceATMyNjc+ATczDgEHDgEHDgEHDgEjIiYnLgEnLgEnLgE1NDY3PgE3MSE+ATc+ATMyFhceARceARceARcjLgEnLgEnLgEnLgEjIgYHDgEHDgEHDgEVFBYXHgEXHgEXHgEzMjY3PgE3Mw4BBw4BBw4BBw4BIyImJy4BJy4BJy4BNTQ2Nz4BNzFABYD6gAU2+xQE7PwjDiETFCwYEiEQDxwNDBQICAsCWwEFBQQKBgcOCAgQCRAaCwsSBwcKAwMDAwMDCgcHEgsLGhAWIQwMDwNaAgkHCBMNDBwRECQUGCwUEyEODRUHBwcHBwcVDQG6DSEUEywZESEQEBwMDBUICAoCWgIFBAQLBgYOCAgRCBAbCwsSBwcKAwMDAwMDCgcHEgsLGxAVIgwMDgNbAgkIBxQMDB0QESQTGSwTFCENDhQHBwgIBwcUDgADgPyAAzX9FgLq1xAYCAkJBQUFDwoKGA8OIRMJDgcHDAUFCAMDAgYGBhEKChgNDRwODRoNDRcKChEGBgYNDQ4iFhQkERAcCwsSBgYGCQgJFw8PJBQULBcYLRUUJA8QGAgJCQUFBQ8KChgPDiETCQ4HBwwFBQgDAwIGBgYRCgoYDQ0cDg0aDQ0XCgoRBgYGDQ0OIhYUJBEQHAsLEgYGBgkICRcPDyQUFCwXGC0VFCQPAAAAAAMAQAAABcADgAAQAG8AzgAAJSEiJjURNDYzITIWFREUBiMBPgE3PgE3PgEzMhYXHgEXHgEXHgEXMy4BJy4BJy4BJy4BIyIGBw4BBw4BBw4BFRQWFx4BFx4BFx4BMzI2Nz4BNz4BNz4BNyMOAQcOASMiJicuAScuAScuATU0Njc5ASE+ATc+ATc+ATMyFhceARceARceARczLgEnLgEnLgEnLgEjIgYHDgEHDgEHDgEVFBYXHgEXHgEXHgEzMjY3PgE3PgE3PgE3Iw4BBw4BIyImJy4BJy4BJy4BNTQ2NzkBBSz7qD1XVz0EWD1XVz38mgMKBwYSCwsbEAkQCAgOBgcKBAQGAVoCCggIFA0MHBAPIRIYLBQTIQ4NFQcHBwcHBxUNDiETFCsZFCQQEB0MDBQIBwkCWgMPDAwiFRAbCwsSBgcKAwQDAwQBuQMKBwcSCwsbEAgRCAcPBgYLBAQFAVsCCggIFQwMHBAQIREZLBMUIQ0OFAcHCAgHBxQODSEUEywZEyQREB0MDBQHCAkCWwMODA0hFRAbCwsSBwcKAwMDAwMAVz4CVj5XVz79qj5XAfQNGAoLEAYGBgIDAwgFBQwHBw4JEyEODxgKCg4GBQUJCQgYEA8kFBUtGBcsFBQkDw8XCQgJBgYGEgsLHBARJBQWIg4NDQYGBhEKChcNDRoODhsNDRgKCxAGBgYCAwMIBQUMBwcOCRMhDg8YCgoOBgUFCQkIGBAPJBQVLRgXLBQUJA8PFwkICQYGBhILCxwQESQUFiIODQ0GBgYRCgoXDQ0aDg4bDQAAAAEA4ACgAyAC4AAUAAABFA4CIyIuAjU0PgIzMh4CFQMgLU5pPDxpTi0tTmk8PGlOLQHAPGlOLS1OaTw8aU4tLU5pPAAAAwBAABAEQAOQAAMAEAAfAAA3CQEhJTI2NTQmIyIGFRQWMxM0JiMiBhURFBYzMjY1EUACAAIA/AACAA4VFQ4OFRUOIxUODhUVDg4VEAOA/IBwFhAPGBYREBYB5g8YFhH+1w8YFhEBKQACAEAAAAPAA4AABwAPAAA3ERc3FwcXIQEhEScHJzcnQICwjbCA/nMB8wGNgLCNsIAAAY2AsI2wgAOA/nOAsI2wgAAAAAUAQAAABcADgAAEAAkAFgAzAE8AADcRIREhASERIREBMzUzESM1IxUjETMVJR4BFx4BFx4BFRQGBw4BBw4BBw4BKwERMx4BFzEHETMyNjc+ATc+ATc+ATU0JicuAScuAScuASsBQAWA+oAFNvsUBOz8VLZgYLZkZAJcFB4ODxQHBwkGBwcTDAwhExMsG7CwFioToEcJFwkKEggHDQUFBQQDAg0HBxMMDCARNwADgPyAAzb9FwLp/sCt/kDAwAHArZ0HFA4PIhYVMBsYLhMWIg8OGAoJBwHAAgcHQ/7mBAMCDQcHFwwMIRMRHQ8OGAoJDwQFBQAEAD0AAAXAA4AAEAAdADsAWQAAJSEiJjURNDYzITIWFREUBiMBIxUjNSMRMzUzFTMRBS4BJy4BJy4BKwERMzI2Nz4BNz4BNz4BNS4BJzkBBw4BBw4BKwERMzIWFx4BFx4BFx4BFRQGBw4BBzkBBSr7qT5YWD4EVz5YWD79s2CzZGSzYAGwBxcMDh8TEycWsLAbLBMTHg8MEwcHBgIICXcIEgoJFAxHNxMeDAwTBwcLBAMEBQUFDQcAWD4CVD5YWD79rD5YAp2trf5AwMABwH0WIg4PFAcHBv5ACQcJGA8OJRMWLBgdMBbiCA0CAwQBHwQFBQ8KChgPDh8REx8PDBcHAAAAAAEAQwAGA6ADegCPAAATFCI1JzAmJzQmJy4BBw4BFRwBFR4BFx4BNz4BNz4BMTYyFTAUBxQWFx4BFx4BMzI2Nz4BNz4BNz4DMTYyFTAOAhUUFhceARcWNjc+ATc+ATc+ATc+Azc8ATU0JicmBgcOAzEGIjUwPAI1NCYnJgYHDgEHDgMxBiI1MCYnLgEnJgYHDgExFZAGBAgECAIFDgoHCQMWBwchDxAPBwc2BQQDAwcFCwkKFwwFDQUHCwcMEwgJHxwVBQUDBAMIBQcVEREkEQwTCAkSBQ4ZDAYyOC8ECQcMFgQDPUg8BAUvJBEiERAWCgYiJRwFBQQCAxgoJyYKBywBugUFDBgPBQoHBQQCAw0HBwsHFGsOEQ0HCCAPE5MKCp0wEzURDBMIBwUEAgUKBw8jDhRDQjEKClNzeCUTIxEQGAgHAQoHFQoRJRAnTSYTr8msDwUGAgcNAwQICQaVrY8JCTVUZjE1OwcCBQoKHBALYGpVCgp6Fh9PBQNHHxOQAwAAAAACAEYAAAQ2A4AABAAIAAAlETMRIwkCEQPGcHD8gAOA/IAAA4D8gAOA/kD+QAOAAAACAIAAAAOAA4AABAAJAAAlESERIQEhESERAoABAP8A/gABAP8AAAOA/IADgPyAA4AAAAAAAQCAAAAEAAOAAAMAAAkBEQEEAPyAA4ABwP5AA4D+QAACAEoAAAQ6A4AABAAIAAA3ESMRMwkCEbpwcAOA/IADgAADgPyAA4D+QP5AA4AAAAABAEMAIANDA6AAKQAAAR4BFRQOAiMiLgI1ND4CMzUNATUiDgIVFB4CMzI+AjU0Jic3Aw0aHDxpjE9PjGg9PWiMTwFA/sA8aU4tLU5pPDxpTi0WE1MCYytjNU+MaD09aIxPT4xoPYCts4AtTmk8PGlOLS1OaTwpSx8wAAAAAQBAAGYCIAMTAAYAABMRMyURJSNAzQET/u3NATMBE839U80ABABAAAAEkAOAABcAKwA6AEEAACUnPgM1NC4CJzceAxUUDgIHMS8BPgE1NCYnNx4DFQ4DBzEnPgE1NCYnNx4BFRQGBycFETMlESUjA9oqJj4rFxcrPiYqKkMwGRkwQyqkKTlERDkpITQkFAEUJDMhwyIoKCIqJjAwJir9zc0BE/7tzQAjKF5pcjw8cWleKSMrZnJ8QUF8cmYrgyM1kVRUkTUjHkhQWC8vWVFHHbMWSCkrRhUjHFw0NVkfKQMBE839U80AAAIAQAAAA8MDgAAHAA8AAAEXIREXNxcHAQcnNychEScDKnD+qXCXeZn+JpZ6lnABV20Cc3ABV3CWepP+I5Z6lnD+qmwAAwBAARMFwAJgAAwAGQAmAAABFAYjIiY1NDYzMhYVIRQGIyImNTQ2MzIWFSEUBiMiJjU0NjMyFhUBjWJFRWFhRUViAhZhRUViYkVFYQIdYUVFYmJFRWEBukViYkVFYWFFRWJiRUVhYUVFYmJFRWFhRQAAAAABAGYAJgOaA1oAIAAAARcWFAcGIi8BBwYiJyY0PwEnJjQ3NjIfATc2MhcWFA8BAqP3JCQkYx329iRjHSQk9/ckJCRjHfb2JGMdJCT3AcD2JGMdJCT39yQkJGMd9vYkYx0kJPf3JCQkYx32AAAGAEQABAO8A3wABAAJAA4AEwAYAB0AAAEhFSE1ESEVITURIRUhNQEzFSM1ETMVIzURMxUjNQGnAhX96wIV/esCFf3r/p2ysrKysrIDfFlZ/p1ZWf6dWVkCxrKy/p2ysv6dsrIAAQAAAAEZmqHTqz9fDzz1AAsEAAAAAADR1CIrAAAAANHUIisAAAAABcADoAAAAAgAAgAAAAAAAAABAAADwP/AAAAGAAAAAAAFwAABAAAAAAAAAAAAAAAAAAAAGwQAAAAAAAAAAAAAAAIAAAAGAABgBAAAQAUAAEAFAABABgAAQAYAAEAEAADgBIAAQAQAAEAGAABABgAAPQPgAEMEgABGBAAAgAQAAIAEgABKA4AAQwTAAEAEwABABAAAQAYAAEAEAABmBAAARAAAAAAACgAUAB4AiAC4AQQBYAKGA7ID1AQIBCoEpAUmBegGAAYaBioGQgaABpIG9AcWB1AHhge4AAEAAAAbAM8ABgAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAOAK4AAQAAAAAAAQAMAAAAAQAAAAAAAgAHAI0AAQAAAAAAAwAMAEUAAQAAAAAABAAMAKIAAQAAAAAABQALACQAAQAAAAAABgAMAGkAAQAAAAAACgAaAMYAAwABBAkAAQAYAAwAAwABBAkAAgAOAJQAAwABBAkAAwAYAFEAAwABBAkABAAYAK4AAwABBAkABQAWAC8AAwABBAkABgAYAHUAAwABBAkACgA0AOBqdy1zaXgtaWNvbnMAagB3AC0AcwBpAHgALQBpAGMAbwBuAHNWZXJzaW9uIDEuMQBWAGUAcgBzAGkAbwBuACAAMQAuADFqdy1zaXgtaWNvbnMAagB3AC0AcwBpAHgALQBpAGMAbwBuAHNqdy1zaXgtaWNvbnMAagB3AC0AcwBpAHgALQBpAGMAbwBuAHNSZWd1bGFyAFIAZQBnAHUAbABhAHJqdy1zaXgtaWNvbnMAagB3AC0AcwBpAHgALQBpAGMAbwBuAHNGb250IGdlbmVyYXRlZCBieSBJY29Nb29uLgBGAG8AbgB0ACAAZwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABJAGMAbwBNAG8AbwBuAC4AAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"},function(e,t,n){function i(e,t){for(var n=0;n<e.length;n++){var i=e[n],o=d[i.id];if(o){o.refs++;for(var r=0;r<o.parts.length;r++)o.parts[r](i.parts[r]);for(;r<i.parts.length;r++)o.parts.push(s(i.parts[r],t))}else{for(var a=[],r=0;r<i.parts.length;r++)a.push(s(i.parts[r],t));d[i.id]={id:i.id,refs:1,parts:a}}}}function o(e){for(var t=[],n={},i=0;i<e.length;i++){var o=e[i],r=o[0],a=o[1],s=o[2],l=o[3],c={css:a,media:s,sourceMap:l};n[r]?n[r].parts.push(c):t.push(n[r]={id:r,parts:[c]})}return t}function r(){var e=document.createElement("style"),t=p();return e.type="text/css",t.appendChild(e),e}function a(){var e=document.createElement("link"),t=p();return e.rel="stylesheet",t.appendChild(e),e}function s(e,t){var n,i,o;if(t.singleton){var s=g++;n=f||(f=r()),i=l.bind(null,n,s,!1),o=l.bind(null,n,s,!0)}else e.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=a(),i=u.bind(null,n),o=function(){n.parentNode.removeChild(n),n.href&&URL.revokeObjectURL(n.href)}):(n=r(),i=c.bind(null,n),o=function(){n.parentNode.removeChild(n)});return i(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;i(e=t)}else o()}}function l(e,t,n,i){var o=n?"":i.css;if(e.styleSheet)e.styleSheet.cssText=m(t,o);else{var r=document.createTextNode(o),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(r,a[t]):e.appendChild(r)}}function c(e,t){var n=t.css,i=t.media;if(t.sourceMap,i&&e.setAttribute("media",i),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}function u(e,t){var n=t.css,i=(t.media,t.sourceMap);i&&(n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(i))))+" */");var o=new Blob([n],{type:"text/css"}),r=e.href;e.href=URL.createObjectURL(o),r&&URL.revokeObjectURL(r)}var d={},A=function(e){var t;return function(){return"undefined"==typeof t&&(t=e.apply(this,arguments)),t}},h=A(function(){return/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())}),p=A(function(){return document.head||document.getElementsByTagName("head")[0]}),f=null,g=0;e.exports=function(e,t){t=t||{},"undefined"==typeof t.singleton&&(t.singleton=h());var n=o(e);return i(n,t),function(e){for(var r=[],a=0;a<n.length;a++){var s=n[a],l=d[s.id];l.refs--,r.push(l)}if(e){var c=o(e);i(c,t)}for(var a=0;a<r.length;a++){var l=r[a];if(0===l.refs){for(var u=0;u<l.parts.length;u++)l.parts[u]();delete d[l.id]}}}};var m=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}()},function(e,t,n){var i,o;i=[n(42),n(45),n(59),n(48),n(89),n(51),n(127),n(95),n(101),n(96),n(83),n(46),n(62),n(114),n(70),n(162),n(67),n(98)],o=function(e,t,n,i,o,r,a,s,l,c,u,d,A,h,p,f,g,m){var w={};return w.api=e,w._=t,w.version=n,w.utils=t.extend(i,r,{canCast:f.available,key:s,extend:t.extend,scriptloader:l,rssparser:g,tea:c,UI:a}),w.utils.css.style=w.utils.style,w.vid=u,w.events=t.extend({},d,{state:A}),w.playlist=t.extend({},h,{item:p}),w.plugins=m,w.cast=f,w}.apply(t,i),!(void 0!==o&&(e.exports=o))}]);


    // JQuery & Plugins
      /*! jQuery v1.11.3 | (c) 2005, 2015 jQuery Foundation, Inc. | jquery.org/license */
      !function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l="1.11.3",m=function(a,b){return new m.fn.init(a,b)},n=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,o=/^-ms-/,p=/-([\da-z])/gi,q=function(a,b){return b.toUpperCase()};m.fn=m.prototype={jquery:l,constructor:m,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=m.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return m.each(this,a,b)},map:function(a){return this.pushStack(m.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},m.extend=m.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||m.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(e=arguments[h]))for(d in e)a=g[d],c=e[d],g!==c&&(j&&c&&(m.isPlainObject(c)||(b=m.isArray(c)))?(b?(b=!1,f=a&&m.isArray(a)?a:[]):f=a&&m.isPlainObject(a)?a:{},g[d]=m.extend(j,f,c)):void 0!==c&&(g[d]=c));return g},m.extend({expando:"jQuery"+(l+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===m.type(a)},isArray:Array.isArray||function(a){return"array"===m.type(a)},isWindow:function(a){return null!=a&&a==a.window},isNumeric:function(a){return!m.isArray(a)&&a-parseFloat(a)+1>=0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},isPlainObject:function(a){var b;if(!a||"object"!==m.type(a)||a.nodeType||m.isWindow(a))return!1;try{if(a.constructor&&!j.call(a,"constructor")&&!j.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}if(k.ownLast)for(b in a)return j.call(a,b);for(b in a);return void 0===b||j.call(a,b)},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(b){b&&m.trim(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(o,"ms-").replace(p,q)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=r(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(n,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(r(Object(a))?m.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){var d;if(b){if(g)return g.call(b,a,c);for(d=b.length,c=c?0>c?Math.max(0,d+c):c:0;d>c;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,b){var c=+b.length,d=0,e=a.length;while(c>d)a[e++]=b[d++];if(c!==c)while(void 0!==b[d])a[e++]=b[d++];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=r(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(f=a[b],b=a,a=f),m.isFunction(a)?(c=d.call(arguments,2),e=function(){return a.apply(b||this,c.concat(d.call(arguments)))},e.guid=a.guid=a.guid||m.guid++,e):void 0},now:function(){return+new Date},support:k}),m.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function r(a){var b="length"in a&&a.length,c=m.type(a);return"function"===c||m.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var s=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ha(),z=ha(),A=ha(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N=M.replace("w","w#"),O="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+N+"))|)"+L+"*\\]",P=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+O+")*)|.*)\\)|)",Q=new RegExp(L+"+","g"),R=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),S=new RegExp("^"+L+"*,"+L+"*"),T=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),U=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),V=new RegExp(P),W=new RegExp("^"+N+"$"),X={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M.replace("w","w*")+")"),ATTR:new RegExp("^"+O),PSEUDO:new RegExp("^"+P),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,aa=/[+~]/,ba=/'|\\/g,ca=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),da=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},ea=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(fa){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function ga(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],k=b.nodeType,"string"!=typeof a||!a||1!==k&&9!==k&&11!==k)return d;if(!e&&p){if(11!==k&&(f=_.exec(a)))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return H.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName)return H.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=1!==k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(ba,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+ra(o[l]);w=aa.test(a)&&pa(b.parentNode)||b,x=o.join(",")}if(x)try{return H.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function ha(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ia(a){return a[u]=!0,a}function ja(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ka(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function la(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function na(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function oa(a){return ia(function(b){return b=+b,ia(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function pa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=ga.support={},f=ga.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=ga.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=g.documentElement,e=g.defaultView,e&&e!==e.top&&(e.addEventListener?e.addEventListener("unload",ea,!1):e.attachEvent&&e.attachEvent("onunload",ea)),p=!f(g),c.attributes=ja(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ja(function(a){return a.appendChild(g.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(g.getElementsByClassName),c.getById=ja(function(a){return o.appendChild(a).id=u,!g.getElementsByName||!g.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(g.querySelectorAll))&&(ja(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\f]' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ja(function(a){var b=g.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ja(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",P)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===g||a.ownerDocument===v&&t(v,a)?-1:b===g||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,h=[a],i=[b];if(!e||!f)return a===g?-1:b===g?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return la(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?la(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},g):n},ga.matches=function(a,b){return ga(a,null,null,b)},ga.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return ga(b,n,null,[a]).length>0},ga.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},ga.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},ga.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},ga.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=ga.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=ga.selectors={cacheLength:50,createPseudo:ia,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ca,da),a[3]=(a[3]||a[4]||a[5]||"").replace(ca,da),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||ga.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&ga.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ca,da).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=ga.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(Q," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||ga.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ia(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ia(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?ia(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ia(function(a){return function(b){return ga(a,b).length>0}}),contains:ia(function(a){return a=a.replace(ca,da),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ia(function(a){return W.test(a||"")||ga.error("unsupported lang: "+a),a=a.replace(ca,da).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:oa(function(){return[0]}),last:oa(function(a,b){return[b-1]}),eq:oa(function(a,b,c){return[0>c?c+b:c]}),even:oa(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:oa(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:oa(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:oa(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=ma(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=na(b);function qa(){}qa.prototype=d.filters=d.pseudos,d.setFilters=new qa,g=ga.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?ga.error(a):z(a,i).slice(0)};function ra(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function sa(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function ta(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ua(a,b,c){for(var d=0,e=b.length;e>d;d++)ga(a,b[d],c);return c}function va(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function wa(a,b,c,d,e,f){return d&&!d[u]&&(d=wa(d)),e&&!e[u]&&(e=wa(e,f)),ia(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ua(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:va(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=va(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=va(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function xa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=sa(function(a){return a===b},h,!0),l=sa(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[sa(ta(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return wa(i>1&&ta(m),i>1&&ra(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&xa(a.slice(i,e)),f>e&&xa(a=a.slice(e)),f>e&&ra(a))}m.push(c)}return ta(m)}function ya(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=F.call(i));s=va(s)}H.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&ga.uniqueSort(i)}return k&&(w=v,j=t),r};return c?ia(f):f}return h=ga.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=xa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,ya(e,d)),f.selector=a}return f},i=ga.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ca,da),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ca,da),aa.test(j[0].type)&&pa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&ra(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,aa.test(a)&&pa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ja(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ja(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ka("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ja(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ka("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ja(function(a){return null==a.getAttribute("disabled")})||ka(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),ga}(a);m.find=s,m.expr=s.selectors,m.expr[":"]=m.expr.pseudos,m.unique=s.uniqueSort,m.text=s.getText,m.isXMLDoc=s.isXML,m.contains=s.contains;var t=m.expr.match.needsContext,u=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,v=/^.[^:#\[\.,]*$/;function w(a,b,c){if(m.isFunction(b))return m.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return m.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(v.test(b))return m.filter(b,a,c);b=m.filter(b,a)}return m.grep(a,function(a){return m.inArray(a,b)>=0!==c})}m.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?m.find.matchesSelector(d,a)?[d]:[]:m.find.matches(a,m.grep(b,function(a){return 1===a.nodeType}))},m.fn.extend({find:function(a){var b,c=[],d=this,e=d.length;if("string"!=typeof a)return this.pushStack(m(a).filter(function(){for(b=0;e>b;b++)if(m.contains(d[b],this))return!0}));for(b=0;e>b;b++)m.find(a,d[b],c);return c=this.pushStack(e>1?m.unique(c):c),c.selector=this.selector?this.selector+" "+a:a,c},filter:function(a){return this.pushStack(w(this,a||[],!1))},not:function(a){return this.pushStack(w(this,a||[],!0))},is:function(a){return!!w(this,"string"==typeof a&&t.test(a)?m(a):a||[],!1).length}});var x,y=a.document,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=m.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a.charAt(0)&&">"===a.charAt(a.length-1)&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||x).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof m?b[0]:b,m.merge(this,m.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:y,!0)),u.test(c[1])&&m.isPlainObject(b))for(c in b)m.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}if(d=y.getElementById(c[2]),d&&d.parentNode){if(d.id!==c[2])return x.find(a);this.length=1,this[0]=d}return this.context=y,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):m.isFunction(a)?"undefined"!=typeof x.ready?x.ready(a):a(m):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),m.makeArray(a,this))};A.prototype=m.fn,x=m(y);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};m.extend({dir:function(a,b,c){var d=[],e=a[b];while(e&&9!==e.nodeType&&(void 0===c||1!==e.nodeType||!m(e).is(c)))1===e.nodeType&&d.push(e),e=e[b];return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),m.fn.extend({has:function(a){var b,c=m(a,this),d=c.length;return this.filter(function(){for(b=0;d>b;b++)if(m.contains(this,c[b]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=t.test(a)||"string"!=typeof a?m(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&m.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?m.unique(f):f)},index:function(a){return a?"string"==typeof a?m.inArray(this[0],m(a)):m.inArray(a.jquery?a[0]:a,this):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(m.unique(m.merge(this.get(),m(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){do a=a[b];while(a&&1!==a.nodeType);return a}m.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return m.dir(a,"parentNode")},parentsUntil:function(a,b,c){return m.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return m.dir(a,"nextSibling")},prevAll:function(a){return m.dir(a,"previousSibling")},nextUntil:function(a,b,c){return m.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return m.dir(a,"previousSibling",c)},siblings:function(a){return m.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return m.sibling(a.firstChild)},contents:function(a){return m.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:m.merge([],a.childNodes)}},function(a,b){m.fn[a]=function(c,d){var e=m.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=m.filter(d,e)),this.length>1&&(C[a]||(e=m.unique(e)),B.test(a)&&(e=e.reverse())),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return m.each(a.match(E)||[],function(a,c){b[c]=!0}),b}m.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):m.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(c=a.memory&&l,d=!0,f=g||0,g=0,e=h.length,b=!0;h&&e>f;f++)if(h[f].apply(l[0],l[1])===!1&&a.stopOnFalse){c=!1;break}b=!1,h&&(i?i.length&&j(i.shift()):c?h=[]:k.disable())},k={add:function(){if(h){var d=h.length;!function f(b){m.each(b,function(b,c){var d=m.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&f(c)})}(arguments),b?e=h.length:c&&(g=d,j(c))}return this},remove:function(){return h&&m.each(arguments,function(a,c){var d;while((d=m.inArray(c,h,d))>-1)h.splice(d,1),b&&(e>=d&&e--,f>=d&&f--)}),this},has:function(a){return a?m.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],e=0,this},disable:function(){return h=i=c=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,c||k.disable(),this},locked:function(){return!i},fireWith:function(a,c){return!h||d&&!i||(c=c||[],c=[a,c.slice?c.slice():c],b?i.push(c):j(c)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!d}};return k},m.extend({Deferred:function(a){var b=[["resolve","done",m.Callbacks("once memory"),"resolved"],["reject","fail",m.Callbacks("once memory"),"rejected"],["notify","progress",m.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return m.Deferred(function(c){m.each(b,function(b,f){var g=m.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&m.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?m.extend(a,d):d}},e={};return d.pipe=d.then,m.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&m.isFunction(a.promise)?e:0,g=1===f?a:m.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&m.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;m.fn.ready=function(a){return m.ready.promise().done(a),this},m.extend({isReady:!1,readyWait:1,holdReady:function(a){a?m.readyWait++:m.ready(!0)},ready:function(a){if(a===!0?!--m.readyWait:!m.isReady){if(!y.body)return setTimeout(m.ready);m.isReady=!0,a!==!0&&--m.readyWait>0||(H.resolveWith(y,[m]),m.fn.triggerHandler&&(m(y).triggerHandler("ready"),m(y).off("ready")))}}});function I(){y.addEventListener?(y.removeEventListener("DOMContentLoaded",J,!1),a.removeEventListener("load",J,!1)):(y.detachEvent("onreadystatechange",J),a.detachEvent("onload",J))}function J(){(y.addEventListener||"load"===event.type||"complete"===y.readyState)&&(I(),m.ready())}m.ready.promise=function(b){if(!H)if(H=m.Deferred(),"complete"===y.readyState)setTimeout(m.ready);else if(y.addEventListener)y.addEventListener("DOMContentLoaded",J,!1),a.addEventListener("load",J,!1);else{y.attachEvent("onreadystatechange",J),a.attachEvent("onload",J);var c=!1;try{c=null==a.frameElement&&y.documentElement}catch(d){}c&&c.doScroll&&!function e(){if(!m.isReady){try{c.doScroll("left")}catch(a){return setTimeout(e,50)}I(),m.ready()}}()}return H.promise(b)};var K="undefined",L;for(L in m(k))break;k.ownLast="0"!==L,k.inlineBlockNeedsLayout=!1,m(function(){var a,b,c,d;c=y.getElementsByTagName("body")[0],c&&c.style&&(b=y.createElement("div"),d=y.createElement("div"),d.style.cssText="position:absolute;border:0;width:0;height:0;top:0;left:-9999px",c.appendChild(d).appendChild(b),typeof b.style.zoom!==K&&(b.style.cssText="display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1",k.inlineBlockNeedsLayout=a=3===b.offsetWidth,a&&(c.style.zoom=1)),c.removeChild(d))}),function(){var a=y.createElement("div");if(null==k.deleteExpando){k.deleteExpando=!0;try{delete a.test}catch(b){k.deleteExpando=!1}}a=null}(),m.acceptData=function(a){var b=m.noData[(a.nodeName+" ").toLowerCase()],c=+a.nodeType||1;return 1!==c&&9!==c?!1:!b||b!==!0&&a.getAttribute("classid")===b};var M=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,N=/([A-Z])/g;function O(a,b,c){if(void 0===c&&1===a.nodeType){var d="data-"+b.replace(N,"-$1").toLowerCase();if(c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:M.test(c)?m.parseJSON(c):c}catch(e){}m.data(a,b,c)}else c=void 0}return c}function P(a){var b;for(b in a)if(("data"!==b||!m.isEmptyObject(a[b]))&&"toJSON"!==b)return!1;

      return!0}function Q(a,b,d,e){if(m.acceptData(a)){var f,g,h=m.expando,i=a.nodeType,j=i?m.cache:a,k=i?a[h]:a[h]&&h;if(k&&j[k]&&(e||j[k].data)||void 0!==d||"string"!=typeof b)return k||(k=i?a[h]=c.pop()||m.guid++:h),j[k]||(j[k]=i?{}:{toJSON:m.noop}),("object"==typeof b||"function"==typeof b)&&(e?j[k]=m.extend(j[k],b):j[k].data=m.extend(j[k].data,b)),g=j[k],e||(g.data||(g.data={}),g=g.data),void 0!==d&&(g[m.camelCase(b)]=d),"string"==typeof b?(f=g[b],null==f&&(f=g[m.camelCase(b)])):f=g,f}}function R(a,b,c){if(m.acceptData(a)){var d,e,f=a.nodeType,g=f?m.cache:a,h=f?a[m.expando]:m.expando;if(g[h]){if(b&&(d=c?g[h]:g[h].data)){m.isArray(b)?b=b.concat(m.map(b,m.camelCase)):b in d?b=[b]:(b=m.camelCase(b),b=b in d?[b]:b.split(" ")),e=b.length;while(e--)delete d[b[e]];if(c?!P(d):!m.isEmptyObject(d))return}(c||(delete g[h].data,P(g[h])))&&(f?m.cleanData([a],!0):k.deleteExpando||g!=g.window?delete g[h]:g[h]=null)}}}m.extend({cache:{},noData:{"applet ":!0,"embed ":!0,"object ":"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"},hasData:function(a){return a=a.nodeType?m.cache[a[m.expando]]:a[m.expando],!!a&&!P(a)},data:function(a,b,c){return Q(a,b,c)},removeData:function(a,b){return R(a,b)},_data:function(a,b,c){return Q(a,b,c,!0)},_removeData:function(a,b){return R(a,b,!0)}}),m.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=m.data(f),1===f.nodeType&&!m._data(f,"parsedAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=m.camelCase(d.slice(5)),O(f,d,e[d])));m._data(f,"parsedAttrs",!0)}return e}return"object"==typeof a?this.each(function(){m.data(this,a)}):arguments.length>1?this.each(function(){m.data(this,a,b)}):f?O(f,a,m.data(f,a)):void 0},removeData:function(a){return this.each(function(){m.removeData(this,a)})}}),m.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=m._data(a,b),c&&(!d||m.isArray(c)?d=m._data(a,b,m.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=m.queue(a,b),d=c.length,e=c.shift(),f=m._queueHooks(a,b),g=function(){m.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return m._data(a,c)||m._data(a,c,{empty:m.Callbacks("once memory").add(function(){m._removeData(a,b+"queue"),m._removeData(a,c)})})}}),m.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?m.queue(this[0],a):void 0===b?this:this.each(function(){var c=m.queue(this,a,b);m._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&m.dequeue(this,a)})},dequeue:function(a){return this.each(function(){m.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=m.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=m._data(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=["Top","Right","Bottom","Left"],U=function(a,b){return a=b||a,"none"===m.css(a,"display")||!m.contains(a.ownerDocument,a)},V=m.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===m.type(c)){e=!0;for(h in c)m.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,m.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(m(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},W=/^(?:checkbox|radio)$/i;!function(){var a=y.createElement("input"),b=y.createElement("div"),c=y.createDocumentFragment();if(b.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",k.leadingWhitespace=3===b.firstChild.nodeType,k.tbody=!b.getElementsByTagName("tbody").length,k.htmlSerialize=!!b.getElementsByTagName("link").length,k.html5Clone="<:nav></:nav>"!==y.createElement("nav").cloneNode(!0).outerHTML,a.type="checkbox",a.checked=!0,c.appendChild(a),k.appendChecked=a.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue,c.appendChild(b),b.innerHTML="<input type='radio' checked='checked' name='t'/>",k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,k.noCloneEvent=!0,b.attachEvent&&(b.attachEvent("onclick",function(){k.noCloneEvent=!1}),b.cloneNode(!0).click()),null==k.deleteExpando){k.deleteExpando=!0;try{delete b.test}catch(d){k.deleteExpando=!1}}}(),function(){var b,c,d=y.createElement("div");for(b in{submit:!0,change:!0,focusin:!0})c="on"+b,(k[b+"Bubbles"]=c in a)||(d.setAttribute(c,"t"),k[b+"Bubbles"]=d.attributes[c].expando===!1);d=null}();var X=/^(?:input|select|textarea)$/i,Y=/^key/,Z=/^(?:mouse|pointer|contextmenu)|click/,$=/^(?:focusinfocus|focusoutblur)$/,_=/^([^.]*)(?:\.(.+)|)$/;function aa(){return!0}function ba(){return!1}function ca(){try{return y.activeElement}catch(a){}}m.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,n,o,p,q,r=m._data(a);if(r){c.handler&&(i=c,c=i.handler,e=i.selector),c.guid||(c.guid=m.guid++),(g=r.events)||(g=r.events={}),(k=r.handle)||(k=r.handle=function(a){return typeof m===K||a&&m.event.triggered===a.type?void 0:m.event.dispatch.apply(k.elem,arguments)},k.elem=a),b=(b||"").match(E)||[""],h=b.length;while(h--)f=_.exec(b[h])||[],o=q=f[1],p=(f[2]||"").split(".").sort(),o&&(j=m.event.special[o]||{},o=(e?j.delegateType:j.bindType)||o,j=m.event.special[o]||{},l=m.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&m.expr.match.needsContext.test(e),namespace:p.join(".")},i),(n=g[o])||(n=g[o]=[],n.delegateCount=0,j.setup&&j.setup.call(a,d,p,k)!==!1||(a.addEventListener?a.addEventListener(o,k,!1):a.attachEvent&&a.attachEvent("on"+o,k))),j.add&&(j.add.call(a,l),l.handler.guid||(l.handler.guid=c.guid)),e?n.splice(n.delegateCount++,0,l):n.push(l),m.event.global[o]=!0);a=null}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,n,o,p,q,r=m.hasData(a)&&m._data(a);if(r&&(k=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=_.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=m.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,n=k[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),i=f=n.length;while(f--)g=n[f],!e&&q!==g.origType||c&&c.guid!==g.guid||h&&!h.test(g.namespace)||d&&d!==g.selector&&("**"!==d||!g.selector)||(n.splice(f,1),g.selector&&n.delegateCount--,l.remove&&l.remove.call(a,g));i&&!n.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||m.removeEvent(a,o,r.handle),delete k[o])}else for(o in k)m.event.remove(a,o+b[j],c,d,!0);m.isEmptyObject(k)&&(delete r.handle,m._removeData(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,l,n,o=[d||y],p=j.call(b,"type")?b.type:b,q=j.call(b,"namespace")?b.namespace.split("."):[];if(h=l=d=d||y,3!==d.nodeType&&8!==d.nodeType&&!$.test(p+m.event.triggered)&&(p.indexOf(".")>=0&&(q=p.split("."),p=q.shift(),q.sort()),g=p.indexOf(":")<0&&"on"+p,b=b[m.expando]?b:new m.Event(p,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=q.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+q.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:m.makeArray(c,[b]),k=m.event.special[p]||{},e||!k.trigger||k.trigger.apply(d,c)!==!1)){if(!e&&!k.noBubble&&!m.isWindow(d)){for(i=k.delegateType||p,$.test(i+p)||(h=h.parentNode);h;h=h.parentNode)o.push(h),l=h;l===(d.ownerDocument||y)&&o.push(l.defaultView||l.parentWindow||a)}n=0;while((h=o[n++])&&!b.isPropagationStopped())b.type=n>1?i:k.bindType||p,f=(m._data(h,"events")||{})[b.type]&&m._data(h,"handle"),f&&f.apply(h,c),f=g&&h[g],f&&f.apply&&m.acceptData(h)&&(b.result=f.apply(h,c),b.result===!1&&b.preventDefault());if(b.type=p,!e&&!b.isDefaultPrevented()&&(!k._default||k._default.apply(o.pop(),c)===!1)&&m.acceptData(d)&&g&&d[p]&&!m.isWindow(d)){l=d[g],l&&(d[g]=null),m.event.triggered=p;try{d[p]()}catch(r){}m.event.triggered=void 0,l&&(d[g]=l)}return b.result}},dispatch:function(a){a=m.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(m._data(this,"events")||{})[a.type]||[],k=m.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=m.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,g=0;while((e=f.handlers[g++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(e.namespace))&&(a.handleObj=e,a.data=e.data,c=((m.event.special[e.origType]||{}).handle||e.handler).apply(f.elem,i),void 0!==c&&(a.result=c)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!=this;i=i.parentNode||this)if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(e=[],f=0;h>f;f++)d=b[f],c=d.selector+" ",void 0===e[c]&&(e[c]=d.needsContext?m(c,this).index(i)>=0:m.find(c,this,null,[i]).length),e[c]&&e.push(d);e.length&&g.push({elem:i,handlers:e})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},fix:function(a){if(a[m.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=Z.test(e)?this.mouseHooks:Y.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new m.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=f.srcElement||y),3===a.target.nodeType&&(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,g.filter?g.filter(a,f):a},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button,g=b.fromElement;return null==a.pageX&&null!=b.clientX&&(d=a.target.ownerDocument||y,e=d.documentElement,c=d.body,a.pageX=b.clientX+(e&&e.scrollLeft||c&&c.scrollLeft||0)-(e&&e.clientLeft||c&&c.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||c&&c.scrollTop||0)-(e&&e.clientTop||c&&c.clientTop||0)),!a.relatedTarget&&g&&(a.relatedTarget=g===a.target?b.toElement:g),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==ca()&&this.focus)try{return this.focus(),!1}catch(a){}},delegateType:"focusin"},blur:{trigger:function(){return this===ca()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return m.nodeName(this,"input")&&"checkbox"===this.type&&this.click?(this.click(),!1):void 0},_default:function(a){return m.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=m.extend(new m.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?m.event.trigger(e,null,b):m.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},m.removeEvent=y.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){var d="on"+b;a.detachEvent&&(typeof a[d]===K&&(a[d]=null),a.detachEvent(d,c))},m.Event=function(a,b){return this instanceof m.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?aa:ba):this.type=a,b&&m.extend(this,b),this.timeStamp=a&&a.timeStamp||m.now(),void(this[m.expando]=!0)):new m.Event(a,b)},m.Event.prototype={isDefaultPrevented:ba,isPropagationStopped:ba,isImmediatePropagationStopped:ba,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=aa,a&&(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=aa,a&&(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=aa,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},m.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){m.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!m.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.submitBubbles||(m.event.special.submit={setup:function(){return m.nodeName(this,"form")?!1:void m.event.add(this,"click._submit keypress._submit",function(a){var b=a.target,c=m.nodeName(b,"input")||m.nodeName(b,"button")?b.form:void 0;c&&!m._data(c,"submitBubbles")&&(m.event.add(c,"submit._submit",function(a){a._submit_bubble=!0}),m._data(c,"submitBubbles",!0))})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&m.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){return m.nodeName(this,"form")?!1:void m.event.remove(this,"._submit")}}),k.changeBubbles||(m.event.special.change={setup:function(){return X.test(this.nodeName)?(("checkbox"===this.type||"radio"===this.type)&&(m.event.add(this,"propertychange._change",function(a){"checked"===a.originalEvent.propertyName&&(this._just_changed=!0)}),m.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1),m.event.simulate("change",this,a,!0)})),!1):void m.event.add(this,"beforeactivate._change",function(a){var b=a.target;X.test(b.nodeName)&&!m._data(b,"changeBubbles")&&(m.event.add(b,"change._change",function(a){!this.parentNode||a.isSimulated||a.isTrigger||m.event.simulate("change",this.parentNode,a,!0)}),m._data(b,"changeBubbles",!0))})},handle:function(a){var b=a.target;return this!==b||a.isSimulated||a.isTrigger||"radio"!==b.type&&"checkbox"!==b.type?a.handleObj.handler.apply(this,arguments):void 0},teardown:function(){return m.event.remove(this,"._change"),!X.test(this.nodeName)}}),k.focusinBubbles||m.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){m.event.simulate(b,a.target,m.event.fix(a),!0)};m.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=m._data(d,b);e||d.addEventListener(a,c,!0),m._data(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=m._data(d,b)-1;e?m._data(d,b,e):(d.removeEventListener(a,c,!0),m._removeData(d,b))}}}),m.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(f in a)this.on(f,b,c,a[f],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=ba;else if(!d)return this;return 1===e&&(g=d,d=function(a){return m().off(a),g.apply(this,arguments)},d.guid=g.guid||(g.guid=m.guid++)),this.each(function(){m.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,m(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=ba),this.each(function(){m.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){m.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?m.event.trigger(a,b,c,!0):void 0}});function da(a){var b=ea.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}var ea="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",fa=/ jQuery\d+="(?:null|\d+)"/g,ga=new RegExp("<(?:"+ea+")[\\s/>]","i"),ha=/^\s+/,ia=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,ja=/<([\w:]+)/,ka=/<tbody/i,la=/<|&#?\w+;/,ma=/<(?:script|style|link)/i,na=/checked\s*(?:[^=]|=\s*.checked.)/i,oa=/^$|\/(?:java|ecma)script/i,pa=/^true\/(.*)/,qa=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ra={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],area:[1,"<map>","</map>"],param:[1,"<object>","</object>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:k.htmlSerialize?[0,"",""]:[1,"X<div>","</div>"]},sa=da(y),ta=sa.appendChild(y.createElement("div"));ra.optgroup=ra.option,ra.tbody=ra.tfoot=ra.colgroup=ra.caption=ra.thead,ra.th=ra.td;function ua(a,b){var c,d,e=0,f=typeof a.getElementsByTagName!==K?a.getElementsByTagName(b||"*"):typeof a.querySelectorAll!==K?a.querySelectorAll(b||"*"):void 0;if(!f)for(f=[],c=a.childNodes||a;null!=(d=c[e]);e++)!b||m.nodeName(d,b)?f.push(d):m.merge(f,ua(d,b));return void 0===b||b&&m.nodeName(a,b)?m.merge([a],f):f}function va(a){W.test(a.type)&&(a.defaultChecked=a.checked)}function wa(a,b){return m.nodeName(a,"table")&&m.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function xa(a){return a.type=(null!==m.find.attr(a,"type"))+"/"+a.type,a}function ya(a){var b=pa.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function za(a,b){for(var c,d=0;null!=(c=a[d]);d++)m._data(c,"globalEval",!b||m._data(b[d],"globalEval"))}function Aa(a,b){if(1===b.nodeType&&m.hasData(a)){var c,d,e,f=m._data(a),g=m._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h)for(d=0,e=h[c].length;e>d;d++)m.event.add(b,c,h[c][d])}g.data&&(g.data=m.extend({},g.data))}}function Ba(a,b){var c,d,e;if(1===b.nodeType){if(c=b.nodeName.toLowerCase(),!k.noCloneEvent&&b[m.expando]){e=m._data(b);for(d in e.events)m.removeEvent(b,d,e.handle);b.removeAttribute(m.expando)}"script"===c&&b.text!==a.text?(xa(b).text=a.text,ya(b)):"object"===c?(b.parentNode&&(b.outerHTML=a.outerHTML),k.html5Clone&&a.innerHTML&&!m.trim(b.innerHTML)&&(b.innerHTML=a.innerHTML)):"input"===c&&W.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&&(b.value=a.value)):"option"===c?b.defaultSelected=b.selected=a.defaultSelected:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}}m.extend({clone:function(a,b,c){var d,e,f,g,h,i=m.contains(a.ownerDocument,a);if(k.html5Clone||m.isXMLDoc(a)||!ga.test("<"+a.nodeName+">")?f=a.cloneNode(!0):(ta.innerHTML=a.outerHTML,ta.removeChild(f=ta.firstChild)),!(k.noCloneEvent&&k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||m.isXMLDoc(a)))for(d=ua(f),h=ua(a),g=0;null!=(e=h[g]);++g)d[g]&&Ba(e,d[g]);if(b)if(c)for(h=h||ua(a),d=d||ua(f),g=0;null!=(e=h[g]);g++)Aa(e,d[g]);else Aa(a,f);return d=ua(f,"script"),d.length>0&&za(d,!i&&ua(a,"script")),d=h=e=null,f},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,l,n=a.length,o=da(b),p=[],q=0;n>q;q++)if(f=a[q],f||0===f)if("object"===m.type(f))m.merge(p,f.nodeType?[f]:f);else if(la.test(f)){h=h||o.appendChild(b.createElement("div")),i=(ja.exec(f)||["",""])[1].toLowerCase(),l=ra[i]||ra._default,h.innerHTML=l[1]+f.replace(ia,"<$1></$2>")+l[2],e=l[0];while(e--)h=h.lastChild;if(!k.leadingWhitespace&&ha.test(f)&&p.push(b.createTextNode(ha.exec(f)[0])),!k.tbody){f="table"!==i||ka.test(f)?"<table>"!==l[1]||ka.test(f)?0:h:h.firstChild,e=f&&f.childNodes.length;while(e--)m.nodeName(j=f.childNodes[e],"tbody")&&!j.childNodes.length&&f.removeChild(j)}m.merge(p,h.childNodes),h.textContent="";while(h.firstChild)h.removeChild(h.firstChild);h=o.lastChild}else p.push(b.createTextNode(f));h&&o.removeChild(h),k.appendChecked||m.grep(ua(p,"input"),va),q=0;while(f=p[q++])if((!d||-1===m.inArray(f,d))&&(g=m.contains(f.ownerDocument,f),h=ua(o.appendChild(f),"script"),g&&za(h),c)){e=0;while(f=h[e++])oa.test(f.type||"")&&c.push(f)}return h=null,o},cleanData:function(a,b){for(var d,e,f,g,h=0,i=m.expando,j=m.cache,l=k.deleteExpando,n=m.event.special;null!=(d=a[h]);h++)if((b||m.acceptData(d))&&(f=d[i],g=f&&j[f])){if(g.events)for(e in g.events)n[e]?m.event.remove(d,e):m.removeEvent(d,e,g.handle);j[f]&&(delete j[f],l?delete d[i]:typeof d.removeAttribute!==K?d.removeAttribute(i):d[i]=null,c.push(f))}}}),m.fn.extend({text:function(a){return V(this,function(a){return void 0===a?m.text(this):this.empty().append((this[0]&&this[0].ownerDocument||y).createTextNode(a))},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=wa(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=wa(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?m.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||m.cleanData(ua(c)),c.parentNode&&(b&&m.contains(c.ownerDocument,c)&&za(ua(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++){1===a.nodeType&&m.cleanData(ua(a,!1));while(a.firstChild)a.removeChild(a.firstChild);a.options&&m.nodeName(a,"select")&&(a.options.length=0)}return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return m.clone(this,a,b)})},html:function(a){return V(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a)return 1===b.nodeType?b.innerHTML.replace(fa,""):void 0;if(!("string"!=typeof a||ma.test(a)||!k.htmlSerialize&&ga.test(a)||!k.leadingWhitespace&&ha.test(a)||ra[(ja.exec(a)||["",""])[1].toLowerCase()])){a=a.replace(ia,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(m.cleanData(ua(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,m.cleanData(ua(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,n=this,o=l-1,p=a[0],q=m.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&na.test(p))return this.each(function(c){var d=n.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(i=m.buildFragment(a,this[0].ownerDocument,!1,this),c=i.firstChild,1===i.childNodes.length&&(i=c),c)){for(g=m.map(ua(i,"script"),xa),f=g.length;l>j;j++)d=i,j!==o&&(d=m.clone(d,!0,!0),f&&m.merge(g,ua(d,"script"))),b.call(this[j],d,j);if(f)for(h=g[g.length-1].ownerDocument,m.map(g,ya),j=0;f>j;j++)d=g[j],oa.test(d.type||"")&&!m._data(d,"globalEval")&&m.contains(h,d)&&(d.src?m._evalUrl&&m._evalUrl(d.src):m.globalEval((d.text||d.textContent||d.innerHTML||"").replace(qa,"")));i=c=null}return this}}),m.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){m.fn[a]=function(a){for(var c,d=0,e=[],g=m(a),h=g.length-1;h>=d;d++)c=d===h?this:this.clone(!0),m(g[d])[b](c),f.apply(e,c.get());return this.pushStack(e)}});var Ca,Da={};function Ea(b,c){var d,e=m(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:m.css(e[0],"display");return e.detach(),f}function Fa(a){var b=y,c=Da[a];return c||(c=Ea(a,b),"none"!==c&&c||(Ca=(Ca||m("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=(Ca[0].contentWindow||Ca[0].contentDocument).document,b.write(),b.close(),c=Ea(a,b),Ca.detach()),Da[a]=c),c}!function(){var a;k.shrinkWrapBlocks=function(){if(null!=a)return a;a=!1;var b,c,d;return c=y.getElementsByTagName("body")[0],c&&c.style?(b=y.createElement("div"),d=y.createElement("div"),d.style.cssText="position:absolute;border:0;width:0;height:0;top:0;left:-9999px",c.appendChild(d).appendChild(b),typeof b.style.zoom!==K&&(b.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:1px;width:1px;zoom:1",b.appendChild(y.createElement("div")).style.width="5px",a=3!==b.offsetWidth),c.removeChild(d),a):void 0}}();var Ga=/^margin/,Ha=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ia,Ja,Ka=/^(top|right|bottom|left)$/;a.getComputedStyle?(Ia=function(b){return b.ownerDocument.defaultView.opener?b.ownerDocument.defaultView.getComputedStyle(b,null):a.getComputedStyle(b,null)},Ja=function(a,b,c){var d,e,f,g,h=a.style;return c=c||Ia(a),g=c?c.getPropertyValue(b)||c[b]:void 0,c&&(""!==g||m.contains(a.ownerDocument,a)||(g=m.style(a,b)),Ha.test(g)&&Ga.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0===g?g:g+""}):y.documentElement.currentStyle&&(Ia=function(a){return a.currentStyle},Ja=function(a,b,c){var d,e,f,g,h=a.style;return c=c||Ia(a),g=c?c[b]:void 0,null==g&&h&&h[b]&&(g=h[b]),Ha.test(g)&&!Ka.test(b)&&(d=h.left,e=a.runtimeStyle,f=e&&e.left,f&&(e.left=a.currentStyle.left),h.left="fontSize"===b?"1em":g,g=h.pixelLeft+"px",h.left=d,f&&(e.left=f)),void 0===g?g:g+""||"auto"});function La(a,b){return{get:function(){var c=a();if(null!=c)return c?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d,e,f,g,h;if(b=y.createElement("div"),b.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",d=b.getElementsByTagName("a")[0],c=d&&d.style){c.cssText="float:left;opacity:.5",k.opacity="0.5"===c.opacity,k.cssFloat=!!c.cssFloat,b.style.backgroundClip="content-box",b.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===b.style.backgroundClip,k.boxSizing=""===c.boxSizing||""===c.MozBoxSizing||""===c.WebkitBoxSizing,m.extend(k,{reliableHiddenOffsets:function(){return null==g&&i(),g},boxSizingReliable:function(){return null==f&&i(),f},pixelPosition:function(){return null==e&&i(),e},reliableMarginRight:function(){return null==h&&i(),h}});function i(){var b,c,d,i;c=y.getElementsByTagName("body")[0],c&&c.style&&(b=y.createElement("div"),d=y.createElement("div"),d.style.cssText="position:absolute;border:0;width:0;height:0;top:0;left:-9999px",c.appendChild(d).appendChild(b),b.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",e=f=!1,h=!0,a.getComputedStyle&&(e="1%"!==(a.getComputedStyle(b,null)||{}).top,f="4px"===(a.getComputedStyle(b,null)||{width:"4px"}).width,i=b.appendChild(y.createElement("div")),i.style.cssText=b.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",i.style.marginRight=i.style.width="0",b.style.width="1px",h=!parseFloat((a.getComputedStyle(i,null)||{}).marginRight),b.removeChild(i)),b.innerHTML="<table><tr><td></td><td>t</td></tr></table>",i=b.getElementsByTagName("td"),i[0].style.cssText="margin:0;border:0;padding:0;display:none",g=0===i[0].offsetHeight,g&&(i[0].style.display="",i[1].style.display="none",g=0===i[0].offsetHeight),c.removeChild(d))}}}(),m.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var Ma=/alpha\([^)]*\)/i,Na=/opacity\s*=\s*([^)]*)/,Oa=/^(none|table(?!-c[ea]).+)/,Pa=new RegExp("^("+S+")(.*)$","i"),Qa=new RegExp("^([+-])=("+S+")","i"),Ra={position:"absolute",visibility:"hidden",display:"block"},Sa={letterSpacing:"0",fontWeight:"400"},Ta=["Webkit","O","Moz","ms"];function Ua(a,b){if(b in a)return b;var c=b.charAt(0).toUpperCase()+b.slice(1),d=b,e=Ta.length;while(e--)if(b=Ta[e]+c,b in a)return b;return d}function Va(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=m._data(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&U(d)&&(f[g]=m._data(d,"olddisplay",Fa(d.nodeName)))):(e=U(d),(c&&"none"!==c||!e)&&m._data(d,"olddisplay",e?c:m.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}function Wa(a,b,c){var d=Pa.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Xa(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=m.css(a,c+T[f],!0,e)),d?("content"===c&&(g-=m.css(a,"padding"+T[f],!0,e)),"margin"!==c&&(g-=m.css(a,"border"+T[f]+"Width",!0,e))):(g+=m.css(a,"padding"+T[f],!0,e),"padding"!==c&&(g+=m.css(a,"border"+T[f]+"Width",!0,e)));return g}function Ya(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=Ia(a),g=k.boxSizing&&"border-box"===m.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=Ja(a,b,f),(0>e||null==e)&&(e=a.style[b]),Ha.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Xa(a,b,c||(g?"border":"content"),d,f)+"px"}m.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Ja(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":k.cssFloat?"cssFloat":"styleFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=m.camelCase(b),i=a.style;if(b=m.cssProps[h]||(m.cssProps[h]=Ua(i,h)),g=m.cssHooks[b]||m.cssHooks[h],void 0===c)return g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b];if(f=typeof c,"string"===f&&(e=Qa.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(m.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||m.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),!(g&&"set"in g&&void 0===(c=g.set(a,c,d)))))try{i[b]=c}catch(j){}}},css:function(a,b,c,d){var e,f,g,h=m.camelCase(b);return b=m.cssProps[h]||(m.cssProps[h]=Ua(a.style,h)),g=m.cssHooks[b]||m.cssHooks[h],g&&"get"in g&&(f=g.get(a,!0,c)),void 0===f&&(f=Ja(a,b,d)),"normal"===f&&b in Sa&&(f=Sa[b]),""===c||c?(e=parseFloat(f),c===!0||m.isNumeric(e)?e||0:f):f}}),m.each(["height","width"],function(a,b){m.cssHooks[b]={get:function(a,c,d){return c?Oa.test(m.css(a,"display"))&&0===a.offsetWidth?m.swap(a,Ra,function(){return Ya(a,b,d)}):Ya(a,b,d):void 0},set:function(a,c,d){var e=d&&Ia(a);return Wa(a,c,d?Xa(a,b,d,k.boxSizing&&"border-box"===m.css(a,"boxSizing",!1,e),e):0)}}}),k.opacity||(m.cssHooks.opacity={get:function(a,b){return Na.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=m.isNumeric(b)?"alpha(opacity="+100*b+")":"",f=d&&d.filter||c.filter||"";c.zoom=1,(b>=1||""===b)&&""===m.trim(f.replace(Ma,""))&&c.removeAttribute&&(c.removeAttribute("filter"),""===b||d&&!d.filter)||(c.filter=Ma.test(f)?f.replace(Ma,e):f+" "+e)}}),m.cssHooks.marginRight=La(k.reliableMarginRight,function(a,b){return b?m.swap(a,{display:"inline-block"},Ja,[a,"marginRight"]):void 0}),m.each({margin:"",padding:"",border:"Width"},function(a,b){m.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+T[d]+b]=f[d]||f[d-2]||f[0];return e}},Ga.test(a)||(m.cssHooks[a+b].set=Wa)}),m.fn.extend({css:function(a,b){return V(this,function(a,b,c){var d,e,f={},g=0;if(m.isArray(b)){for(d=Ia(a),e=b.length;e>g;g++)f[b[g]]=m.css(a,b[g],!1,d);return f}return void 0!==c?m.style(a,b,c):m.css(a,b)},a,b,arguments.length>1)},show:function(){return Va(this,!0)},hide:function(){return Va(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){U(this)?m(this).show():m(this).hide()})}});function Za(a,b,c,d,e){
      return new Za.prototype.init(a,b,c,d,e)}m.Tween=Za,Za.prototype={constructor:Za,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(m.cssNumber[c]?"":"px")},cur:function(){var a=Za.propHooks[this.prop];return a&&a.get?a.get(this):Za.propHooks._default.get(this)},run:function(a){var b,c=Za.propHooks[this.prop];return this.options.duration?this.pos=b=m.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Za.propHooks._default.set(this),this}},Za.prototype.init.prototype=Za.prototype,Za.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=m.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){m.fx.step[a.prop]?m.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[m.cssProps[a.prop]]||m.cssHooks[a.prop])?m.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Za.propHooks.scrollTop=Za.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},m.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},m.fx=Za.prototype.init,m.fx.step={};var $a,_a,ab=/^(?:toggle|show|hide)$/,bb=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),cb=/queueHooks$/,db=[ib],eb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=bb.exec(b),f=e&&e[3]||(m.cssNumber[a]?"":"px"),g=(m.cssNumber[a]||"px"!==f&&+d)&&bb.exec(m.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,m.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function fb(){return setTimeout(function(){$a=void 0}),$a=m.now()}function gb(a,b){var c,d={height:a},e=0;for(b=b?1:0;4>e;e+=2-b)c=T[e],d["margin"+c]=d["padding"+c]=a;return b&&(d.opacity=d.width=a),d}function hb(a,b,c){for(var d,e=(eb[b]||[]).concat(eb["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function ib(a,b,c){var d,e,f,g,h,i,j,l,n=this,o={},p=a.style,q=a.nodeType&&U(a),r=m._data(a,"fxshow");c.queue||(h=m._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,n.always(function(){n.always(function(){h.unqueued--,m.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[p.overflow,p.overflowX,p.overflowY],j=m.css(a,"display"),l="none"===j?m._data(a,"olddisplay")||Fa(a.nodeName):j,"inline"===l&&"none"===m.css(a,"float")&&(k.inlineBlockNeedsLayout&&"inline"!==Fa(a.nodeName)?p.zoom=1:p.display="inline-block")),c.overflow&&(p.overflow="hidden",k.shrinkWrapBlocks()||n.always(function(){p.overflow=c.overflow[0],p.overflowX=c.overflow[1],p.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],ab.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(q?"hide":"show")){if("show"!==e||!r||void 0===r[d])continue;q=!0}o[d]=r&&r[d]||m.style(a,d)}else j=void 0;if(m.isEmptyObject(o))"inline"===("none"===j?Fa(a.nodeName):j)&&(p.display=j);else{r?"hidden"in r&&(q=r.hidden):r=m._data(a,"fxshow",{}),f&&(r.hidden=!q),q?m(a).show():n.done(function(){m(a).hide()}),n.done(function(){var b;m._removeData(a,"fxshow");for(b in o)m.style(a,b,o[b])});for(d in o)g=hb(q?r[d]:0,d,n),d in r||(r[d]=g.start,q&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function jb(a,b){var c,d,e,f,g;for(c in a)if(d=m.camelCase(c),e=b[d],f=a[c],m.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=m.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function kb(a,b,c){var d,e,f=0,g=db.length,h=m.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=$a||fb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:m.extend({},b),opts:m.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:$a||fb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=m.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(jb(k,j.opts.specialEasing);g>f;f++)if(d=db[f].call(j,a,k,j.opts))return d;return m.map(k,hb,j),m.isFunction(j.opts.start)&&j.opts.start.call(a,j),m.fx.timer(m.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}m.Animation=m.extend(kb,{tweener:function(a,b){m.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],eb[c]=eb[c]||[],eb[c].unshift(b)},prefilter:function(a,b){b?db.unshift(a):db.push(a)}}),m.speed=function(a,b,c){var d=a&&"object"==typeof a?m.extend({},a):{complete:c||!c&&b||m.isFunction(a)&&a,duration:a,easing:c&&b||b&&!m.isFunction(b)&&b};return d.duration=m.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in m.fx.speeds?m.fx.speeds[d.duration]:m.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){m.isFunction(d.old)&&d.old.call(this),d.queue&&m.dequeue(this,d.queue)},d},m.fn.extend({fadeTo:function(a,b,c,d){return this.filter(U).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=m.isEmptyObject(a),f=m.speed(b,c,d),g=function(){var b=kb(this,m.extend({},a),f);(e||m._data(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=m.timers,g=m._data(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&cb.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&m.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=m._data(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=m.timers,g=d?d.length:0;for(c.finish=!0,m.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),m.each(["toggle","show","hide"],function(a,b){var c=m.fn[b];m.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(gb(b,!0),a,d,e)}}),m.each({slideDown:gb("show"),slideUp:gb("hide"),slideToggle:gb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){m.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),m.timers=[],m.fx.tick=function(){var a,b=m.timers,c=0;for($a=m.now();c<b.length;c++)a=b[c],a()||b[c]!==a||b.splice(c--,1);b.length||m.fx.stop(),$a=void 0},m.fx.timer=function(a){m.timers.push(a),a()?m.fx.start():m.timers.pop()},m.fx.interval=13,m.fx.start=function(){_a||(_a=setInterval(m.fx.tick,m.fx.interval))},m.fx.stop=function(){clearInterval(_a),_a=null},m.fx.speeds={slow:600,fast:200,_default:400},m.fn.delay=function(a,b){return a=m.fx?m.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a,b,c,d,e;b=y.createElement("div"),b.setAttribute("className","t"),b.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",d=b.getElementsByTagName("a")[0],c=y.createElement("select"),e=c.appendChild(y.createElement("option")),a=b.getElementsByTagName("input")[0],d.style.cssText="top:1px",k.getSetAttribute="t"!==b.className,k.style=/top/.test(d.getAttribute("style")),k.hrefNormalized="/a"===d.getAttribute("href"),k.checkOn=!!a.value,k.optSelected=e.selected,k.enctype=!!y.createElement("form").enctype,c.disabled=!0,k.optDisabled=!e.disabled,a=y.createElement("input"),a.setAttribute("value",""),k.input=""===a.getAttribute("value"),a.value="t",a.setAttribute("type","radio"),k.radioValue="t"===a.value}();var lb=/\r/g;m.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=m.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,m(this).val()):a,null==e?e="":"number"==typeof e?e+="":m.isArray(e)&&(e=m.map(e,function(a){return null==a?"":a+""})),b=m.valHooks[this.type]||m.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=m.valHooks[e.type]||m.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(lb,""):null==c?"":c)}}}),m.extend({valHooks:{option:{get:function(a){var b=m.find.attr(a,"value");return null!=b?b:m.trim(m.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&m.nodeName(c.parentNode,"optgroup"))){if(b=m(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=m.makeArray(b),g=e.length;while(g--)if(d=e[g],m.inArray(m.valHooks.option.get(d),f)>=0)try{d.selected=c=!0}catch(h){d.scrollHeight}else d.selected=!1;return c||(a.selectedIndex=-1),e}}}}),m.each(["radio","checkbox"],function(){m.valHooks[this]={set:function(a,b){return m.isArray(b)?a.checked=m.inArray(m(a).val(),b)>=0:void 0}},k.checkOn||(m.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var mb,nb,ob=m.expr.attrHandle,pb=/^(?:checked|selected)$/i,qb=k.getSetAttribute,rb=k.input;m.fn.extend({attr:function(a,b){return V(this,m.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){m.removeAttr(this,a)})}}),m.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===K?m.prop(a,b,c):(1===f&&m.isXMLDoc(a)||(b=b.toLowerCase(),d=m.attrHooks[b]||(m.expr.match.bool.test(b)?nb:mb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=m.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void m.removeAttr(a,b))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=m.propFix[c]||c,m.expr.match.bool.test(c)?rb&&qb||!pb.test(c)?a[d]=!1:a[m.camelCase("default-"+c)]=a[d]=!1:m.attr(a,c,""),a.removeAttribute(qb?c:d)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&m.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),nb={set:function(a,b,c){return b===!1?m.removeAttr(a,c):rb&&qb||!pb.test(c)?a.setAttribute(!qb&&m.propFix[c]||c,c):a[m.camelCase("default-"+c)]=a[c]=!0,c}},m.each(m.expr.match.bool.source.match(/\w+/g),function(a,b){var c=ob[b]||m.find.attr;ob[b]=rb&&qb||!pb.test(b)?function(a,b,d){var e,f;return d||(f=ob[b],ob[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,ob[b]=f),e}:function(a,b,c){return c?void 0:a[m.camelCase("default-"+b)]?b.toLowerCase():null}}),rb&&qb||(m.attrHooks.value={set:function(a,b,c){return m.nodeName(a,"input")?void(a.defaultValue=b):mb&&mb.set(a,b,c)}}),qb||(mb={set:function(a,b,c){var d=a.getAttributeNode(c);return d||a.setAttributeNode(d=a.ownerDocument.createAttribute(c)),d.value=b+="","value"===c||b===a.getAttribute(c)?b:void 0}},ob.id=ob.name=ob.coords=function(a,b,c){var d;return c?void 0:(d=a.getAttributeNode(b))&&""!==d.value?d.value:null},m.valHooks.button={get:function(a,b){var c=a.getAttributeNode(b);return c&&c.specified?c.value:void 0},set:mb.set},m.attrHooks.contenteditable={set:function(a,b,c){mb.set(a,""===b?!1:b,c)}},m.each(["width","height"],function(a,b){m.attrHooks[b]={set:function(a,c){return""===c?(a.setAttribute(b,"auto"),c):void 0}}})),k.style||(m.attrHooks.style={get:function(a){return a.style.cssText||void 0},set:function(a,b){return a.style.cssText=b+""}});var sb=/^(?:input|select|textarea|button|object)$/i,tb=/^(?:a|area)$/i;m.fn.extend({prop:function(a,b){return V(this,m.prop,a,b,arguments.length>1)},removeProp:function(a){return a=m.propFix[a]||a,this.each(function(){try{this[a]=void 0,delete this[a]}catch(b){}})}}),m.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!m.isXMLDoc(a),f&&(b=m.propFix[b]||b,e=m.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=m.find.attr(a,"tabindex");return b?parseInt(b,10):sb.test(a.nodeName)||tb.test(a.nodeName)&&a.href?0:-1}}}}),k.hrefNormalized||m.each(["href","src"],function(a,b){m.propHooks[b]={get:function(a){return a.getAttribute(b,4)}}}),k.optSelected||(m.propHooks.selected={get:function(a){var b=a.parentNode;return b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex),null}}),m.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){m.propFix[this.toLowerCase()]=this}),k.enctype||(m.propFix.enctype="encoding");var ub=/[\t\r\n\f]/g;m.fn.extend({addClass:function(a){var b,c,d,e,f,g,h=0,i=this.length,j="string"==typeof a&&a;if(m.isFunction(a))return this.each(function(b){m(this).addClass(a.call(this,b,this.className))});if(j)for(b=(a||"").match(E)||[];i>h;h++)if(c=this[h],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ub," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=m.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0,i=this.length,j=0===arguments.length||"string"==typeof a&&a;if(m.isFunction(a))return this.each(function(b){m(this).removeClass(a.call(this,b,this.className))});if(j)for(b=(a||"").match(E)||[];i>h;h++)if(c=this[h],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ub," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?m.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(m.isFunction(a)?function(c){m(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=m(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===K||"boolean"===c)&&(this.className&&m._data(this,"__className__",this.className),this.className=this.className||a===!1?"":m._data(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ub," ").indexOf(b)>=0)return!0;return!1}}),m.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){m.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),m.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var vb=m.now(),wb=/\?/,xb=/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;m.parseJSON=function(b){if(a.JSON&&a.JSON.parse)return a.JSON.parse(b+"");var c,d=null,e=m.trim(b+"");return e&&!m.trim(e.replace(xb,function(a,b,e,f){return c&&b&&(d=0),0===d?a:(c=e||b,d+=!f-!e,"")}))?Function("return "+e)():m.error("Invalid JSON: "+b)},m.parseXML=function(b){var c,d;if(!b||"string"!=typeof b)return null;try{a.DOMParser?(d=new DOMParser,c=d.parseFromString(b,"text/xml")):(c=new ActiveXObject("Microsoft.XMLDOM"),c.async="false",c.loadXML(b))}catch(e){c=void 0}return c&&c.documentElement&&!c.getElementsByTagName("parsererror").length||m.error("Invalid XML: "+b),c};var yb,zb,Ab=/#.*$/,Bb=/([?&])_=[^&]*/,Cb=/^(.*?):[ \t]*([^\r\n]*)\r?$/gm,Db=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Eb=/^(?:GET|HEAD)$/,Fb=/^\/\//,Gb=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,Hb={},Ib={},Jb="*/".concat("*");try{zb=location.href}catch(Kb){zb=y.createElement("a"),zb.href="",zb=zb.href}yb=Gb.exec(zb.toLowerCase())||[];function Lb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(m.isFunction(c))while(d=f[e++])"+"===d.charAt(0)?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function Mb(a,b,c,d){var e={},f=a===Ib;function g(h){var i;return e[h]=!0,m.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function Nb(a,b){var c,d,e=m.ajaxSettings.flatOptions||{};for(d in b)void 0!==b[d]&&((e[d]?a:c||(c={}))[d]=b[d]);return c&&m.extend(!0,a,c),a}function Ob(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===e&&(e=a.mimeType||b.getResponseHeader("Content-Type"));if(e)for(g in h)if(h[g]&&h[g].test(e)){i.unshift(g);break}if(i[0]in c)f=i[0];else{for(g in c){if(!i[0]||a.converters[g+" "+i[0]]){f=g;break}d||(d=g)}f=f||d}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function Pb(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}m.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:zb,type:"GET",isLocal:Db.test(yb[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Jb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":m.parseJSON,"text xml":m.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?Nb(Nb(a,m.ajaxSettings),b):Nb(m.ajaxSettings,a)},ajaxPrefilter:Lb(Hb),ajaxTransport:Lb(Ib),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=m.ajaxSetup({},b),l=k.context||k,n=k.context&&(l.nodeType||l.jquery)?m(l):m.event,o=m.Deferred(),p=m.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!j){j={};while(b=Cb.exec(f))j[b[1].toLowerCase()]=b[2]}b=j[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?f:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return i&&i.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||zb)+"").replace(Ab,"").replace(Fb,yb[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=m.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(c=Gb.exec(k.url.toLowerCase()),k.crossDomain=!(!c||c[1]===yb[1]&&c[2]===yb[2]&&(c[3]||("http:"===c[1]?"80":"443"))===(yb[3]||("http:"===yb[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=m.param(k.data,k.traditional)),Mb(Hb,k,b,v),2===t)return v;h=m.event&&k.global,h&&0===m.active++&&m.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!Eb.test(k.type),e=k.url,k.hasContent||(k.data&&(e=k.url+=(wb.test(e)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=Bb.test(e)?e.replace(Bb,"$1_="+vb++):e+(wb.test(e)?"&":"?")+"_="+vb++)),k.ifModified&&(m.lastModified[e]&&v.setRequestHeader("If-Modified-Since",m.lastModified[e]),m.etag[e]&&v.setRequestHeader("If-None-Match",m.etag[e])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+Jb+"; q=0.01":""):k.accepts["*"]);for(d in k.headers)v.setRequestHeader(d,k.headers[d]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(d in{success:1,error:1,complete:1})v[d](k[d]);if(i=Mb(Ib,k,b,v)){v.readyState=1,h&&n.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,i.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,c,d){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),i=void 0,f=d||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,c&&(u=Ob(k,v,c)),u=Pb(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(m.lastModified[e]=w),w=v.getResponseHeader("etag"),w&&(m.etag[e]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,h&&n.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),h&&(n.trigger("ajaxComplete",[v,k]),--m.active||m.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return m.get(a,b,c,"json")},getScript:function(a,b){return m.get(a,void 0,b,"script")}}),m.each(["get","post"],function(a,b){m[b]=function(a,c,d,e){return m.isFunction(c)&&(e=e||d,d=c,c=void 0),m.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),m._evalUrl=function(a){return m.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},m.fn.extend({wrapAll:function(a){if(m.isFunction(a))return this.each(function(b){m(this).wrapAll(a.call(this,b))});if(this[0]){var b=m(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&1===a.firstChild.nodeType)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){return this.each(m.isFunction(a)?function(b){m(this).wrapInner(a.call(this,b))}:function(){var b=m(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=m.isFunction(a);return this.each(function(c){m(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){m.nodeName(this,"body")||m(this).replaceWith(this.childNodes)}).end()}}),m.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0||!k.reliableHiddenOffsets()&&"none"===(a.style&&a.style.display||m.css(a,"display"))},m.expr.filters.visible=function(a){return!m.expr.filters.hidden(a)};var Qb=/%20/g,Rb=/\[\]$/,Sb=/\r?\n/g,Tb=/^(?:submit|button|image|reset|file)$/i,Ub=/^(?:input|select|textarea|keygen)/i;function Vb(a,b,c,d){var e;if(m.isArray(b))m.each(b,function(b,e){c||Rb.test(a)?d(a,e):Vb(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==m.type(b))d(a,b);else for(e in b)Vb(a+"["+e+"]",b[e],c,d)}m.param=function(a,b){var c,d=[],e=function(a,b){b=m.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=m.ajaxSettings&&m.ajaxSettings.traditional),m.isArray(a)||a.jquery&&!m.isPlainObject(a))m.each(a,function(){e(this.name,this.value)});else for(c in a)Vb(c,a[c],b,e);return d.join("&").replace(Qb,"+")},m.fn.extend({serialize:function(){return m.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=m.prop(this,"elements");return a?m.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!m(this).is(":disabled")&&Ub.test(this.nodeName)&&!Tb.test(a)&&(this.checked||!W.test(a))}).map(function(a,b){var c=m(this).val();return null==c?null:m.isArray(c)?m.map(c,function(a){return{name:b.name,value:a.replace(Sb,"\r\n")}}):{name:b.name,value:c.replace(Sb,"\r\n")}}).get()}}),m.ajaxSettings.xhr=void 0!==a.ActiveXObject?function(){return!this.isLocal&&/^(get|post|head|put|delete|options)$/i.test(this.type)&&Zb()||$b()}:Zb;var Wb=0,Xb={},Yb=m.ajaxSettings.xhr();a.attachEvent&&a.attachEvent("onunload",function(){for(var a in Xb)Xb[a](void 0,!0)}),k.cors=!!Yb&&"withCredentials"in Yb,Yb=k.ajax=!!Yb,Yb&&m.ajaxTransport(function(a){if(!a.crossDomain||k.cors){var b;return{send:function(c,d){var e,f=a.xhr(),g=++Wb;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)void 0!==c[e]&&f.setRequestHeader(e,c[e]+"");f.send(a.hasContent&&a.data||null),b=function(c,e){var h,i,j;if(b&&(e||4===f.readyState))if(delete Xb[g],b=void 0,f.onreadystatechange=m.noop,e)4!==f.readyState&&f.abort();else{j={},h=f.status,"string"==typeof f.responseText&&(j.text=f.responseText);try{i=f.statusText}catch(k){i=""}h||!a.isLocal||a.crossDomain?1223===h&&(h=204):h=j.text?200:404}j&&d(h,i,j,f.getAllResponseHeaders())},a.async?4===f.readyState?setTimeout(b):f.onreadystatechange=Xb[g]=b:b()},abort:function(){b&&b(void 0,!0)}}}});function Zb(){try{return new a.XMLHttpRequest}catch(b){}}function $b(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}m.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return m.globalEval(a),a}}}),m.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),m.ajaxTransport("script",function(a){if(a.crossDomain){var b,c=y.head||m("head")[0]||y.documentElement;return{send:function(d,e){b=y.createElement("script"),b.async=!0,a.scriptCharset&&(b.charset=a.scriptCharset),b.src=a.url,b.onload=b.onreadystatechange=function(a,c){(c||!b.readyState||/loaded|complete/.test(b.readyState))&&(b.onload=b.onreadystatechange=null,b.parentNode&&b.parentNode.removeChild(b),b=null,c||e(200,"success"))},c.insertBefore(b,c.firstChild)},abort:function(){b&&b.onload(void 0,!0)}}}});var _b=[],ac=/(=)\?(?=&|$)|\?\?/;m.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=_b.pop()||m.expando+"_"+vb++;return this[a]=!0,a}}),m.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(ac.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&ac.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=m.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(ac,"$1"+e):b.jsonp!==!1&&(b.url+=(wb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||m.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,_b.push(e)),g&&m.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),m.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||y;var d=u.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=m.buildFragment([a],b,e),e&&e.length&&m(e).remove(),m.merge([],d.childNodes))};var bc=m.fn.load;m.fn.load=function(a,b,c){if("string"!=typeof a&&bc)return bc.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=m.trim(a.slice(h,a.length)),a=a.slice(0,h)),m.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(f="POST"),g.length>0&&m.ajax({url:a,type:f,dataType:"html",data:b}).done(function(a){e=arguments,g.html(d?m("<div>").append(m.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,e||[a.responseText,b,a])}),this},m.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){m.fn[b]=function(a){return this.on(b,a)}}),m.expr.filters.animated=function(a){return m.grep(m.timers,function(b){return a===b.elem}).length};var cc=a.document.documentElement;function dc(a){return m.isWindow(a)?a:9===a.nodeType?a.defaultView||a.parentWindow:!1}m.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=m.css(a,"position"),l=m(a),n={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=m.css(a,"top"),i=m.css(a,"left"),j=("absolute"===k||"fixed"===k)&&m.inArray("auto",[f,i])>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),m.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(n.top=b.top-h.top+g),null!=b.left&&(n.left=b.left-h.left+e),"using"in b?b.using.call(a,n):l.css(n)}},m.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){m.offset.setOffset(this,a,b)});var b,c,d={top:0,left:0},e=this[0],f=e&&e.ownerDocument;if(f)return b=f.documentElement,m.contains(b,e)?(typeof e.getBoundingClientRect!==K&&(d=e.getBoundingClientRect()),c=dc(f),{top:d.top+(c.pageYOffset||b.scrollTop)-(b.clientTop||0),left:d.left+(c.pageXOffset||b.scrollLeft)-(b.clientLeft||0)}):d},position:function(){if(this[0]){var a,b,c={top:0,left:0},d=this[0];return"fixed"===m.css(d,"position")?b=d.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),m.nodeName(a[0],"html")||(c=a.offset()),c.top+=m.css(a[0],"borderTopWidth",!0),c.left+=m.css(a[0],"borderLeftWidth",!0)),{top:b.top-c.top-m.css(d,"marginTop",!0),left:b.left-c.left-m.css(d,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||cc;while(a&&!m.nodeName(a,"html")&&"static"===m.css(a,"position"))a=a.offsetParent;return a||cc})}}),m.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c=/Y/.test(b);m.fn[a]=function(d){return V(this,function(a,d,e){var f=dc(a);return void 0===e?f?b in f?f[b]:f.document.documentElement[d]:a[d]:void(f?f.scrollTo(c?m(f).scrollLeft():e,c?e:m(f).scrollTop()):a[d]=e)},a,d,arguments.length,null)}}),m.each(["top","left"],function(a,b){m.cssHooks[b]=La(k.pixelPosition,function(a,c){return c?(c=Ja(a,b),Ha.test(c)?m(a).position()[b]+"px":c):void 0})}),m.each({Height:"height",Width:"width"},function(a,b){m.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){m.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return V(this,function(b,c,d){var e;return m.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?m.css(b,c,g):m.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),m.fn.size=function(){return this.length},m.fn.andSelf=m.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return m});var ec=a.jQuery,fc=a.$;return m.noConflict=function(b){return a.$===m&&(a.$=fc),b&&a.jQuery===m&&(a.jQuery=ec),m},typeof b===K&&(a.jQuery=a.$=m),m});
      var $ = jQuery.noConflict(true); 

      /*! jQuery UI - v1.11.4 - 2016-03-18 */
      (function(e){"function"==typeof define&&define.amd?define(["jquery"],e):e($)})(function(e){function t(t,s){var n,a,o,r=t.nodeName.toLowerCase();return"area"===r?(n=t.parentNode,a=n.name,t.href&&a&&"map"===n.nodeName.toLowerCase()?(o=e("img[usemap='#"+a+"']")[0],!!o&&i(o)):!1):(/^(input|select|textarea|button|object)$/.test(r)?!t.disabled:"a"===r?t.href||s:s)&&i(t)}function i(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}e.ui=e.ui||{},e.extend(e.ui,{version:"1.11.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({scrollParent:function(t){var i=this.css("position"),s="absolute"===i,n=t?/(auto|scroll|hidden)/:/(auto|scroll)/,a=this.parents().filter(function(){var t=e(this);return s&&"static"===t.css("position")?!1:n.test(t.css("overflow")+t.css("overflow-y")+t.css("overflow-x"))}).eq(0);return"fixed"!==i&&a.length?a:e(this[0].ownerDocument||document)},uniqueId:function(){var e=0;return function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++e)})}}(),removeUniqueId:function(){return this.each(function(){/^ui-id-\d+$/.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(i){return!!e.data(i,t)}}):function(t,i,s){return!!e.data(t,s[3])},focusable:function(i){return t(i,!isNaN(e.attr(i,"tabindex")))},tabbable:function(i){var s=e.attr(i,"tabindex"),n=isNaN(s);return(n||s>=0)&&t(i,!n)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(t,i){function s(t,i,s,a){return e.each(n,function(){i-=parseFloat(e.css(t,"padding"+this))||0,s&&(i-=parseFloat(e.css(t,"border"+this+"Width"))||0),a&&(i-=parseFloat(e.css(t,"margin"+this))||0)}),i}var n="Width"===i?["Left","Right"]:["Top","Bottom"],a=i.toLowerCase(),o={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+i]=function(t){return void 0===t?o["inner"+i].call(this):this.each(function(){e(this).css(a,s(this,t)+"px")})},e.fn["outer"+i]=function(t,n){return"number"!=typeof t?o["outer"+i].call(this,t):this.each(function(){e(this).css(a,s(this,t,!0,n)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(i){return arguments.length?t.call(this,e.camelCase(i)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.fn.extend({focus:function(t){return function(i,s){return"number"==typeof i?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),s&&s.call(t)},i)}):t.apply(this,arguments)}}(e.fn.focus),disableSelection:function(){var e="onselectstart"in document.createElement("div")?"selectstart":"mousedown";return function(){return this.bind(e+".ui-disableSelection",function(e){e.preventDefault()})}}(),enableSelection:function(){return this.unbind(".ui-disableSelection")},zIndex:function(t){if(void 0!==t)return this.css("zIndex",t);if(this.length)for(var i,s,n=e(this[0]);n.length&&n[0]!==document;){if(i=n.css("position"),("absolute"===i||"relative"===i||"fixed"===i)&&(s=parseInt(n.css("zIndex"),10),!isNaN(s)&&0!==s))return s;n=n.parent()}return 0}}),e.ui.plugin={add:function(t,i,s){var n,a=e.ui[t].prototype;for(n in s)a.plugins[n]=a.plugins[n]||[],a.plugins[n].push([i,s[n]])},call:function(e,t,i,s){var n,a=e.plugins[t];if(a&&(s||e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType))for(n=0;a.length>n;n++)e.options[a[n][0]]&&a[n][1].apply(e.element,i)}};var s=0,n=Array.prototype.slice;e.cleanData=function(t){return function(i){var s,n,a;for(a=0;null!=(n=i[a]);a++)try{s=e._data(n,"events"),s&&s.remove&&e(n).triggerHandler("remove")}catch(o){}t(i)}}(e.cleanData),e.widget=function(t,i,s){var n,a,o,r,h={},l=t.split(".")[0];return t=t.split(".")[1],n=l+"-"+t,s||(s=i,i=e.Widget),e.expr[":"][n.toLowerCase()]=function(t){return!!e.data(t,n)},e[l]=e[l]||{},a=e[l][t],o=e[l][t]=function(e,t){return this._createWidget?(arguments.length&&this._createWidget(e,t),void 0):new o(e,t)},e.extend(o,a,{version:s.version,_proto:e.extend({},s),_childConstructors:[]}),r=new i,r.options=e.widget.extend({},r.options),e.each(s,function(t,s){return e.isFunction(s)?(h[t]=function(){var e=function(){return i.prototype[t].apply(this,arguments)},n=function(e){return i.prototype[t].apply(this,e)};return function(){var t,i=this._super,a=this._superApply;return this._super=e,this._superApply=n,t=s.apply(this,arguments),this._super=i,this._superApply=a,t}}(),void 0):(h[t]=s,void 0)}),o.prototype=e.widget.extend(r,{widgetEventPrefix:a?r.widgetEventPrefix||t:t},h,{constructor:o,namespace:l,widgetName:t,widgetFullName:n}),a?(e.each(a._childConstructors,function(t,i){var s=i.prototype;e.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete a._childConstructors):i._childConstructors.push(o),e.widget.bridge(t,o),o},e.widget.extend=function(t){for(var i,s,a=n.call(arguments,1),o=0,r=a.length;r>o;o++)for(i in a[o])s=a[o][i],a[o].hasOwnProperty(i)&&void 0!==s&&(t[i]=e.isPlainObject(s)?e.isPlainObject(t[i])?e.widget.extend({},t[i],s):e.widget.extend({},s):s);return t},e.widget.bridge=function(t,i){var s=i.prototype.widgetFullName||t;e.fn[t]=function(a){var o="string"==typeof a,r=n.call(arguments,1),h=this;return o?this.each(function(){var i,n=e.data(this,s);return"instance"===a?(h=n,!1):n?e.isFunction(n[a])&&"_"!==a.charAt(0)?(i=n[a].apply(n,r),i!==n&&void 0!==i?(h=i&&i.jquery?h.pushStack(i.get()):i,!1):void 0):e.error("no such method '"+a+"' for "+t+" widget instance"):e.error("cannot call methods on "+t+" prior to initialization; "+"attempted to call method '"+a+"'")}):(r.length&&(a=e.widget.extend.apply(null,[a].concat(r))),this.each(function(){var t=e.data(this,s);t?(t.option(a||{}),t._init&&t._init()):e.data(this,s,new i(a,this))})),h}},e.Widget=function(){},e.Widget._childConstructors=[],e.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(t,i){i=e(i||this.defaultElement||this)[0],this.element=e(i),this.uuid=s++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=e(),this.hoverable=e(),this.focusable=e(),i!==this&&(e.data(i,this.widgetFullName,this),this._on(!0,this.element,{remove:function(e){e.target===i&&this.destroy()}}),this.document=e(i.style?i.ownerDocument:i.document||i),this.window=e(this.document[0].defaultView||this.document[0].parentWindow)),this.options=e.widget.extend({},this.options,this._getCreateOptions(),t),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:e.noop,_getCreateEventData:e.noop,_create:e.noop,_init:e.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:e.noop,widget:function(){return this.element},option:function(t,i){var s,n,a,o=t;if(0===arguments.length)return e.widget.extend({},this.options);if("string"==typeof t)if(o={},s=t.split("."),t=s.shift(),s.length){for(n=o[t]=e.widget.extend({},this.options[t]),a=0;s.length-1>a;a++)n[s[a]]=n[s[a]]||{},n=n[s[a]];if(t=s.pop(),1===arguments.length)return void 0===n[t]?null:n[t];n[t]=i}else{if(1===arguments.length)return void 0===this.options[t]?null:this.options[t];o[t]=i}return this._setOptions(o),this},_setOptions:function(e){var t;for(t in e)this._setOption(t,e[t]);return this},_setOption:function(e,t){return this.options[e]=t,"disabled"===e&&(this.widget().toggleClass(this.widgetFullName+"-disabled",!!t),t&&(this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus"))),this},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_on:function(t,i,s){var n,a=this;"boolean"!=typeof t&&(s=i,i=t,t=!1),s?(i=n=e(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),e.each(s,function(s,o){function r(){return t||a.options.disabled!==!0&&!e(this).hasClass("ui-state-disabled")?("string"==typeof o?a[o]:o).apply(a,arguments):void 0}"string"!=typeof o&&(r.guid=o.guid=o.guid||r.guid||e.guid++);var h=s.match(/^([\w:-]*)\s*(.*)$/),l=h[1]+a.eventNamespace,u=h[2];u?n.delegate(u,l,r):i.bind(l,r)})},_off:function(t,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.unbind(i).undelegate(i),this.bindings=e(this.bindings.not(t).get()),this.focusable=e(this.focusable.not(t).get()),this.hoverable=e(this.hoverable.not(t).get())},_delay:function(e,t){function i(){return("string"==typeof e?s[e]:e).apply(s,arguments)}var s=this;return setTimeout(i,t||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){e(t.currentTarget).addClass("ui-state-hover")},mouseleave:function(t){e(t.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){e(t.currentTarget).addClass("ui-state-focus")},focusout:function(t){e(t.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(t,i,s){var n,a,o=this.options[t];if(s=s||{},i=e.Event(i),i.type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),i.target=this.element[0],a=i.originalEvent)for(n in a)n in i||(i[n]=a[n]);return this.element.trigger(i,s),!(e.isFunction(o)&&o.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},e.each({show:"fadeIn",hide:"fadeOut"},function(t,i){e.Widget.prototype["_"+t]=function(s,n,a){"string"==typeof n&&(n={effect:n});var o,r=n?n===!0||"number"==typeof n?i:n.effect||i:t;n=n||{},"number"==typeof n&&(n={duration:n}),o=!e.isEmptyObject(n),n.complete=a,n.delay&&s.delay(n.delay),o&&e.effects&&e.effects.effect[r]?s[t](n):r!==t&&s[r]?s[r](n.duration,n.easing,a):s.queue(function(i){e(this)[t](),a&&a.call(s[0]),i()})}}),e.widget;var a=!1;e(document).mouseup(function(){a=!1}),e.widget("ui.mouse",{version:"1.11.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var t=this;this.element.bind("mousedown."+this.widgetName,function(e){return t._mouseDown(e)}).bind("click."+this.widgetName,function(i){return!0===e.data(i.target,t.widgetName+".preventClickEvent")?(e.removeData(i.target,t.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&this.document.unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(t){if(!a){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(t),this._mouseDownEvent=t;var i=this,s=1===t.which,n="string"==typeof this.options.cancel&&t.target.nodeName?e(t.target).closest(this.options.cancel).length:!1;return s&&!n&&this._mouseCapture(t)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(t)!==!1,!this._mouseStarted)?(t.preventDefault(),!0):(!0===e.data(t.target,this.widgetName+".preventClickEvent")&&e.removeData(t.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(e){return i._mouseMove(e)},this._mouseUpDelegate=function(e){return i._mouseUp(e)},this.document.bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),t.preventDefault(),a=!0,!0)):!0}},_mouseMove:function(t){if(this._mouseMoved){if(e.ui.ie&&(!document.documentMode||9>document.documentMode)&&!t.button)return this._mouseUp(t);if(!t.which)return this._mouseUp(t)}return(t.which||t.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(t),t.preventDefault()):(this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,t)!==!1,this._mouseStarted?this._mouseDrag(t):this._mouseUp(t)),!this._mouseStarted)},_mouseUp:function(t){return this.document.unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,t.target===this._mouseDownEvent.target&&e.data(t.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(t)),a=!1,!1},_mouseDistanceMet:function(e){return Math.max(Math.abs(this._mouseDownEvent.pageX-e.pageX),Math.abs(this._mouseDownEvent.pageY-e.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),e.widget("ui.draggable",e.ui.mouse,{version:"1.11.4",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"===this.options.helper&&this._setPositionRelative(),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._setHandleClassName(),this._mouseInit()},_setOption:function(e,t){this._super(e,t),"handle"===e&&(this._removeHandleClassName(),this._setHandleClassName())},_destroy:function(){return(this.helper||this.element).is(".ui-draggable-dragging")?(this.destroyOnClear=!0,void 0):(this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._removeHandleClassName(),this._mouseDestroy(),void 0)},_mouseCapture:function(t){var i=this.options;return this._blurActiveElement(t),this.helper||i.disabled||e(t.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(t),this.handle?(this._blockFrames(i.iframeFix===!0?"iframe":i.iframeFix),!0):!1)},_blockFrames:function(t){this.iframeBlocks=this.document.find(t).map(function(){var t=e(this);return e("<div>").css("position","absolute").appendTo(t.parent()).outerWidth(t.outerWidth()).outerHeight(t.outerHeight()).offset(t.offset())[0]})},_unblockFrames:function(){this.iframeBlocks&&(this.iframeBlocks.remove(),delete this.iframeBlocks)},_blurActiveElement:function(t){var i=this.document[0];if(this.handleElement.is(t.target))try{i.activeElement&&"body"!==i.activeElement.nodeName.toLowerCase()&&e(i.activeElement).blur()}catch(s){}},_mouseStart:function(t){var i=this.options;return this.helper=this._createHelper(t),this.helper.addClass("ui-draggable-dragging"),this._cacheHelperProportions(),e.ui.ddmanager&&(e.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(!0),this.offsetParent=this.helper.offsetParent(),this.hasFixedAncestor=this.helper.parents().filter(function(){return"fixed"===e(this).css("position")}).length>0,this.positionAbs=this.element.offset(),this._refreshOffsets(t),this.originalPosition=this.position=this._generatePosition(t,!1),this.originalPageX=t.pageX,this.originalPageY=t.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",t)===!1?(this._clear(),!1):(this._cacheHelperProportions(),e.ui.ddmanager&&!i.dropBehaviour&&e.ui.ddmanager.prepareOffsets(this,t),this._normalizeRightBottom(),this._mouseDrag(t,!0),e.ui.ddmanager&&e.ui.ddmanager.dragStart(this,t),!0)},_refreshOffsets:function(e){this.offset={top:this.positionAbs.top-this.margins.top,left:this.positionAbs.left-this.margins.left,scroll:!1,parent:this._getParentOffset(),relative:this._getRelativeOffset()},this.offset.click={left:e.pageX-this.offset.left,top:e.pageY-this.offset.top}},_mouseDrag:function(t,i){if(this.hasFixedAncestor&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(t,!0),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",t,s)===!1)return this._mouseUp({}),!1;this.position=s.position}return this.helper[0].style.left=this.position.left+"px",this.helper[0].style.top=this.position.top+"px",e.ui.ddmanager&&e.ui.ddmanager.drag(this,t),!1},_mouseStop:function(t){var i=this,s=!1;return e.ui.ddmanager&&!this.options.dropBehaviour&&(s=e.ui.ddmanager.drop(this,t)),this.dropped&&(s=this.dropped,this.dropped=!1),"invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||e.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?e(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",t)!==!1&&i._clear()}):this._trigger("stop",t)!==!1&&this._clear(),!1},_mouseUp:function(t){return this._unblockFrames(),e.ui.ddmanager&&e.ui.ddmanager.dragStop(this,t),this.handleElement.is(t.target)&&this.element.focus(),e.ui.mouse.prototype._mouseUp.call(this,t)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(t){return this.options.handle?!!e(t.target).closest(this.element.find(this.options.handle)).length:!0},_setHandleClassName:function(){this.handleElement=this.options.handle?this.element.find(this.options.handle):this.element,this.handleElement.addClass("ui-draggable-handle")},_removeHandleClassName:function(){this.handleElement.removeClass("ui-draggable-handle")},_createHelper:function(t){var i=this.options,s=e.isFunction(i.helper),n=s?e(i.helper.apply(this.element[0],[t])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return n.parents("body").length||n.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s&&n[0]===this.element[0]&&this._setPositionRelative(),n[0]===this.element[0]||/(fixed|absolute)/.test(n.css("position"))||n.css("position","absolute"),n},_setPositionRelative:function(){/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative")},_adjustOffsetFromHelper:function(t){"string"==typeof t&&(t=t.split(" ")),e.isArray(t)&&(t={left:+t[0],top:+t[1]||0}),"left"in t&&(this.offset.click.left=t.left+this.margins.left),"right"in t&&(this.offset.click.left=this.helperProportions.width-t.right+this.margins.left),"top"in t&&(this.offset.click.top=t.top+this.margins.top),"bottom"in t&&(this.offset.click.top=this.helperProportions.height-t.bottom+this.margins.top)},_isRootNode:function(e){return/(html|body)/i.test(e.tagName)||e===this.document[0]},_getParentOffset:function(){var t=this.offsetParent.offset(),i=this.document[0];return"absolute"===this.cssPosition&&this.scrollParent[0]!==i&&e.contains(this.scrollParent[0],this.offsetParent[0])&&(t.left+=this.scrollParent.scrollLeft(),t.top+=this.scrollParent.scrollTop()),this._isRootNode(this.offsetParent[0])&&(t={top:0,left:0}),{top:t.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:t.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"!==this.cssPosition)return{top:0,left:0};var e=this.element.position(),t=this._isRootNode(this.scrollParent[0]);return{top:e.top-(parseInt(this.helper.css("top"),10)||0)+(t?0:this.scrollParent.scrollTop()),left:e.left-(parseInt(this.helper.css("left"),10)||0)+(t?0:this.scrollParent.scrollLeft())}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var t,i,s,n=this.options,a=this.document[0];return this.relativeContainer=null,n.containment?"window"===n.containment?(this.containment=[e(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,e(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,e(window).scrollLeft()+e(window).width()-this.helperProportions.width-this.margins.left,e(window).scrollTop()+(e(window).height()||a.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):"document"===n.containment?(this.containment=[0,0,e(a).width()-this.helperProportions.width-this.margins.left,(e(a).height()||a.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],void 0):n.containment.constructor===Array?(this.containment=n.containment,void 0):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=e(n.containment),s=i[0],s&&(t=/(scroll|auto)/.test(i.css("overflow")),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(t?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(t?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relativeContainer=i),void 0):(this.containment=null,void 0)},_convertPositionTo:function(e,t){t||(t=this.position);var i="absolute"===e?1:-1,s=this._isRootNode(this.scrollParent[0]);return{top:t.top+this.offset.relative.top*i+this.offset.parent.top*i-("fixed"===this.cssPosition?-this.offset.scroll.top:s?0:this.offset.scroll.top)*i,left:t.left+this.offset.relative.left*i+this.offset.parent.left*i-("fixed"===this.cssPosition?-this.offset.scroll.left:s?0:this.offset.scroll.left)*i}},_generatePosition:function(e,t){var i,s,n,a,o=this.options,r=this._isRootNode(this.scrollParent[0]),h=e.pageX,l=e.pageY;return r&&this.offset.scroll||(this.offset.scroll={top:this.scrollParent.scrollTop(),left:this.scrollParent.scrollLeft()}),t&&(this.containment&&(this.relativeContainer?(s=this.relativeContainer.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,e.pageX-this.offset.click.left<i[0]&&(h=i[0]+this.offset.click.left),e.pageY-this.offset.click.top<i[1]&&(l=i[1]+this.offset.click.top),e.pageX-this.offset.click.left>i[2]&&(h=i[2]+this.offset.click.left),e.pageY-this.offset.click.top>i[3]&&(l=i[3]+this.offset.click.top)),o.grid&&(n=o.grid[1]?this.originalPageY+Math.round((l-this.originalPageY)/o.grid[1])*o.grid[1]:this.originalPageY,l=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-o.grid[1]:n+o.grid[1]:n,a=o.grid[0]?this.originalPageX+Math.round((h-this.originalPageX)/o.grid[0])*o.grid[0]:this.originalPageX,h=i?a-this.offset.click.left>=i[0]||a-this.offset.click.left>i[2]?a:a-this.offset.click.left>=i[0]?a-o.grid[0]:a+o.grid[0]:a),"y"===o.axis&&(h=this.originalPageX),"x"===o.axis&&(l=this.originalPageY)),{top:l-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.offset.scroll.top:r?0:this.offset.scroll.top),left:h-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.offset.scroll.left:r?0:this.offset.scroll.left)}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1,this.destroyOnClear&&this.destroy()},_normalizeRightBottom:function(){"y"!==this.options.axis&&"auto"!==this.helper.css("right")&&(this.helper.width(this.helper.width()),this.helper.css("right","auto")),"x"!==this.options.axis&&"auto"!==this.helper.css("bottom")&&(this.helper.height(this.helper.height()),this.helper.css("bottom","auto"))},_trigger:function(t,i,s){return s=s||this._uiHash(),e.ui.plugin.call(this,t,[i,s,this],!0),/^(drag|start|stop)/.test(t)&&(this.positionAbs=this._convertPositionTo("absolute"),s.offset=this.positionAbs),e.Widget.prototype._trigger.call(this,t,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),e.ui.plugin.add("draggable","connectToSortable",{start:function(t,i,s){var n=e.extend({},i,{item:s.element});s.sortables=[],e(s.options.connectToSortable).each(function(){var i=e(this).sortable("instance");i&&!i.options.disabled&&(s.sortables.push(i),i.refreshPositions(),i._trigger("activate",t,n))})},stop:function(t,i,s){var n=e.extend({},i,{item:s.element});s.cancelHelperRemoval=!1,e.each(s.sortables,function(){var e=this;e.isOver?(e.isOver=0,s.cancelHelperRemoval=!0,e.cancelHelperRemoval=!1,e._storedCSS={position:e.placeholder.css("position"),top:e.placeholder.css("top"),left:e.placeholder.css("left")},e._mouseStop(t),e.options.helper=e.options._helper):(e.cancelHelperRemoval=!0,e._trigger("deactivate",t,n))})},drag:function(t,i,s){e.each(s.sortables,function(){var n=!1,a=this;a.positionAbs=s.positionAbs,a.helperProportions=s.helperProportions,a.offset.click=s.offset.click,a._intersectsWith(a.containerCache)&&(n=!0,e.each(s.sortables,function(){return this.positionAbs=s.positionAbs,this.helperProportions=s.helperProportions,this.offset.click=s.offset.click,this!==a&&this._intersectsWith(this.containerCache)&&e.contains(a.element[0],this.element[0])&&(n=!1),n})),n?(a.isOver||(a.isOver=1,s._parent=i.helper.parent(),a.currentItem=i.helper.appendTo(a.element).data("ui-sortable-item",!0),a.options._helper=a.options.helper,a.options.helper=function(){return i.helper[0]},t.target=a.currentItem[0],a._mouseCapture(t,!0),a._mouseStart(t,!0,!0),a.offset.click.top=s.offset.click.top,a.offset.click.left=s.offset.click.left,a.offset.parent.left-=s.offset.parent.left-a.offset.parent.left,a.offset.parent.top-=s.offset.parent.top-a.offset.parent.top,s._trigger("toSortable",t),s.dropped=a.element,e.each(s.sortables,function(){this.refreshPositions()}),s.currentItem=s.element,a.fromOutside=s),a.currentItem&&(a._mouseDrag(t),i.position=a.position)):a.isOver&&(a.isOver=0,a.cancelHelperRemoval=!0,a.options._revert=a.options.revert,a.options.revert=!1,a._trigger("out",t,a._uiHash(a)),a._mouseStop(t,!0),a.options.revert=a.options._revert,a.options.helper=a.options._helper,a.placeholder&&a.placeholder.remove(),i.helper.appendTo(s._parent),s._refreshOffsets(t),i.position=s._generatePosition(t,!0),s._trigger("fromSortable",t),s.dropped=!1,e.each(s.sortables,function(){this.refreshPositions()}))})}}),e.ui.plugin.add("draggable","cursor",{start:function(t,i,s){var n=e("body"),a=s.options;n.css("cursor")&&(a._cursor=n.css("cursor")),n.css("cursor",a.cursor)},stop:function(t,i,s){var n=s.options;n._cursor&&e("body").css("cursor",n._cursor)}}),e.ui.plugin.add("draggable","opacity",{start:function(t,i,s){var n=e(i.helper),a=s.options;n.css("opacity")&&(a._opacity=n.css("opacity")),n.css("opacity",a.opacity)},stop:function(t,i,s){var n=s.options;n._opacity&&e(i.helper).css("opacity",n._opacity)}}),e.ui.plugin.add("draggable","scroll",{start:function(e,t,i){i.scrollParentNotHidden||(i.scrollParentNotHidden=i.helper.scrollParent(!1)),i.scrollParentNotHidden[0]!==i.document[0]&&"HTML"!==i.scrollParentNotHidden[0].tagName&&(i.overflowOffset=i.scrollParentNotHidden.offset())},drag:function(t,i,s){var n=s.options,a=!1,o=s.scrollParentNotHidden[0],r=s.document[0];o!==r&&"HTML"!==o.tagName?(n.axis&&"x"===n.axis||(s.overflowOffset.top+o.offsetHeight-t.pageY<n.scrollSensitivity?o.scrollTop=a=o.scrollTop+n.scrollSpeed:t.pageY-s.overflowOffset.top<n.scrollSensitivity&&(o.scrollTop=a=o.scrollTop-n.scrollSpeed)),n.axis&&"y"===n.axis||(s.overflowOffset.left+o.offsetWidth-t.pageX<n.scrollSensitivity?o.scrollLeft=a=o.scrollLeft+n.scrollSpeed:t.pageX-s.overflowOffset.left<n.scrollSensitivity&&(o.scrollLeft=a=o.scrollLeft-n.scrollSpeed))):(n.axis&&"x"===n.axis||(t.pageY-e(r).scrollTop()<n.scrollSensitivity?a=e(r).scrollTop(e(r).scrollTop()-n.scrollSpeed):e(window).height()-(t.pageY-e(r).scrollTop())<n.scrollSensitivity&&(a=e(r).scrollTop(e(r).scrollTop()+n.scrollSpeed))),n.axis&&"y"===n.axis||(t.pageX-e(r).scrollLeft()<n.scrollSensitivity?a=e(r).scrollLeft(e(r).scrollLeft()-n.scrollSpeed):e(window).width()-(t.pageX-e(r).scrollLeft())<n.scrollSensitivity&&(a=e(r).scrollLeft(e(r).scrollLeft()+n.scrollSpeed)))),a!==!1&&e.ui.ddmanager&&!n.dropBehaviour&&e.ui.ddmanager.prepareOffsets(s,t)}}),e.ui.plugin.add("draggable","snap",{start:function(t,i,s){var n=s.options;s.snapElements=[],e(n.snap.constructor!==String?n.snap.items||":data(ui-draggable)":n.snap).each(function(){var t=e(this),i=t.offset();this!==s.element[0]&&s.snapElements.push({item:this,width:t.outerWidth(),height:t.outerHeight(),top:i.top,left:i.left})})},drag:function(t,i,s){var n,a,o,r,h,l,u,d,c,p,f=s.options,m=f.snapTolerance,g=i.offset.left,v=g+s.helperProportions.width,y=i.offset.top,_=y+s.helperProportions.height;for(c=s.snapElements.length-1;c>=0;c--)h=s.snapElements[c].left-s.margins.left,l=h+s.snapElements[c].width,u=s.snapElements[c].top-s.margins.top,d=u+s.snapElements[c].height,h-m>v||g>l+m||u-m>_||y>d+m||!e.contains(s.snapElements[c].item.ownerDocument,s.snapElements[c].item)?(s.snapElements[c].snapping&&s.options.snap.release&&s.options.snap.release.call(s.element,t,e.extend(s._uiHash(),{snapItem:s.snapElements[c].item})),s.snapElements[c].snapping=!1):("inner"!==f.snapMode&&(n=m>=Math.abs(u-_),a=m>=Math.abs(d-y),o=m>=Math.abs(h-v),r=m>=Math.abs(l-g),n&&(i.position.top=s._convertPositionTo("relative",{top:u-s.helperProportions.height,left:0}).top),a&&(i.position.top=s._convertPositionTo("relative",{top:d,left:0}).top),o&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h-s.helperProportions.width}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l}).left)),p=n||a||o||r,"outer"!==f.snapMode&&(n=m>=Math.abs(u-y),a=m>=Math.abs(d-_),o=m>=Math.abs(h-g),r=m>=Math.abs(l-v),n&&(i.position.top=s._convertPositionTo("relative",{top:u,left:0}).top),a&&(i.position.top=s._convertPositionTo("relative",{top:d-s.helperProportions.height,left:0}).top),o&&(i.position.left=s._convertPositionTo("relative",{top:0,left:h}).left),r&&(i.position.left=s._convertPositionTo("relative",{top:0,left:l-s.helperProportions.width}).left)),!s.snapElements[c].snapping&&(n||a||o||r||p)&&s.options.snap.snap&&s.options.snap.snap.call(s.element,t,e.extend(s._uiHash(),{snapItem:s.snapElements[c].item})),s.snapElements[c].snapping=n||a||o||r||p)}}),e.ui.plugin.add("draggable","stack",{start:function(t,i,s){var n,a=s.options,o=e.makeArray(e(a.stack)).sort(function(t,i){return(parseInt(e(t).css("zIndex"),10)||0)-(parseInt(e(i).css("zIndex"),10)||0)});o.length&&(n=parseInt(e(o[0]).css("zIndex"),10)||0,e(o).each(function(t){e(this).css("zIndex",n+t)}),this.css("zIndex",n+o.length))}}),e.ui.plugin.add("draggable","zIndex",{start:function(t,i,s){var n=e(i.helper),a=s.options;n.css("zIndex")&&(a._zIndex=n.css("zIndex")),n.css("zIndex",a.zIndex)},stop:function(t,i,s){var n=s.options;n._zIndex&&e(i.helper).css("zIndex",n._zIndex)}}),e.ui.draggable,e.widget("ui.slider",e.ui.mouse,{version:"1.11.4",widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},numPages:5,_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this._calculateNewMax(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget"+" ui-widget-content"+" ui-corner-all"),this._refresh(),this._setOption("disabled",this.options.disabled),this._animateOff=!1
      },_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var t,i,s=this.options,n=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),a="<span class='ui-slider-handle ui-state-default ui-corner-all' tabindex='0'></span>",o=[];for(i=s.values&&s.values.length||1,n.length>i&&(n.slice(i).remove(),n=n.slice(0,i)),t=n.length;i>t;t++)o.push(a);this.handles=n.add(e(o.join("")).appendTo(this.element)),this.handle=this.handles.eq(0),this.handles.each(function(t){e(this).data("ui-slider-handle-index",t)})},_createRange:function(){var t=this.options,i="";t.range?(t.range===!0&&(t.values?t.values.length&&2!==t.values.length?t.values=[t.values[0],t.values[0]]:e.isArray(t.values)&&(t.values=t.values.slice(0)):t.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({left:"",bottom:""}):(this.range=e("<div></div>").appendTo(this.element),i="ui-slider-range ui-widget-header ui-corner-all"),this.range.addClass(i+("min"===t.range||"max"===t.range?" ui-slider-range-"+t.range:""))):(this.range&&this.range.remove(),this.range=null)},_setupEvents:function(){this._off(this.handles),this._on(this.handles,this._handleEvents),this._hoverable(this.handles),this._focusable(this.handles)},_destroy:function(){this.handles.remove(),this.range&&this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"),this._mouseDestroy()},_mouseCapture:function(t){var i,s,n,a,o,r,h,l,u=this,d=this.options;return d.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),i={x:t.pageX,y:t.pageY},s=this._normValueFromMouse(i),n=this._valueMax()-this._valueMin()+1,this.handles.each(function(t){var i=Math.abs(s-u.values(t));(n>i||n===i&&(t===u._lastChangedValue||u.values(t)===d.min))&&(n=i,a=e(this),o=t)}),r=this._start(t,o),r===!1?!1:(this._mouseSliding=!0,this._handleIndex=o,a.addClass("ui-state-active").focus(),h=a.offset(),l=!e(t.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=l?{left:0,top:0}:{left:t.pageX-h.left-a.width()/2,top:t.pageY-h.top-a.height()/2-(parseInt(a.css("borderTopWidth"),10)||0)-(parseInt(a.css("borderBottomWidth"),10)||0)+(parseInt(a.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(t,o,s),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(e){var t={x:e.pageX,y:e.pageY},i=this._normValueFromMouse(t);return this._slide(e,this._handleIndex,i),!1},_mouseStop:function(e){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(e,this._handleIndex),this._change(e,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(e){var t,i,s,n,a;return"horizontal"===this.orientation?(t=this.elementSize.width,i=e.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(t=this.elementSize.height,i=e.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),s=i/t,s>1&&(s=1),0>s&&(s=0),"vertical"===this.orientation&&(s=1-s),n=this._valueMax()-this._valueMin(),a=this._valueMin()+s*n,this._trimAlignValue(a)},_start:function(e,t){var i={handle:this.handles[t],value:this.value()};return this.options.values&&this.options.values.length&&(i.value=this.values(t),i.values=this.values()),this._trigger("start",e,i)},_slide:function(e,t,i){var s,n,a;this.options.values&&this.options.values.length?(s=this.values(t?0:1),2===this.options.values.length&&this.options.range===!0&&(0===t&&i>s||1===t&&s>i)&&(i=s),i!==this.values(t)&&(n=this.values(),n[t]=i,a=this._trigger("slide",e,{handle:this.handles[t],value:i,values:n}),s=this.values(t?0:1),a!==!1&&this.values(t,i))):i!==this.value()&&(a=this._trigger("slide",e,{handle:this.handles[t],value:i}),a!==!1&&this.value(i))},_stop:function(e,t){var i={handle:this.handles[t],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(t),i.values=this.values()),this._trigger("stop",e,i)},_change:function(e,t){if(!this._keySliding&&!this._mouseSliding){var i={handle:this.handles[t],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(t),i.values=this.values()),this._lastChangedValue=t,this._trigger("change",e,i)}},value:function(e){return arguments.length?(this.options.value=this._trimAlignValue(e),this._refreshValue(),this._change(null,0),void 0):this._value()},values:function(t,i){var s,n,a;if(arguments.length>1)return this.options.values[t]=this._trimAlignValue(i),this._refreshValue(),this._change(null,t),void 0;if(!arguments.length)return this._values();if(!e.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(t):this.value();for(s=this.options.values,n=arguments[0],a=0;s.length>a;a+=1)s[a]=this._trimAlignValue(n[a]),this._change(null,a);this._refreshValue()},_setOption:function(t,i){var s,n=0;switch("range"===t&&this.options.range===!0&&("min"===i?(this.options.value=this._values(0),this.options.values=null):"max"===i&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),e.isArray(this.options.values)&&(n=this.options.values.length),"disabled"===t&&this.element.toggleClass("ui-state-disabled",!!i),this._super(t,i),t){case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue(),this.handles.css("horizontal"===i?"bottom":"left","");break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),s=0;n>s;s+=1)this._change(null,s);this._animateOff=!1;break;case"step":case"min":case"max":this._animateOff=!0,this._calculateNewMax(),this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_value:function(){var e=this.options.value;return e=this._trimAlignValue(e)},_values:function(e){var t,i,s;if(arguments.length)return t=this.options.values[e],t=this._trimAlignValue(t);if(this.options.values&&this.options.values.length){for(i=this.options.values.slice(),s=0;i.length>s;s+=1)i[s]=this._trimAlignValue(i[s]);return i}return[]},_trimAlignValue:function(e){if(this._valueMin()>=e)return this._valueMin();if(e>=this._valueMax())return this._valueMax();var t=this.options.step>0?this.options.step:1,i=(e-this._valueMin())%t,s=e-i;return 2*Math.abs(i)>=t&&(s+=i>0?t:-t),parseFloat(s.toFixed(5))},_calculateNewMax:function(){var e=this.options.max,t=this._valueMin(),i=this.options.step,s=Math.floor(+(e-t).toFixed(this._precision())/i)*i;e=s+t,this.max=parseFloat(e.toFixed(this._precision()))},_precision:function(){var e=this._precisionOf(this.options.step);return null!==this.options.min&&(e=Math.max(e,this._precisionOf(this.options.min))),e},_precisionOf:function(e){var t=""+e,i=t.indexOf(".");return-1===i?0:t.length-i-1},_valueMin:function(){return this.options.min},_valueMax:function(){return this.max},_refreshValue:function(){var t,i,s,n,a,o=this.options.range,r=this.options,h=this,l=this._animateOff?!1:r.animate,u={};this.options.values&&this.options.values.length?this.handles.each(function(s){i=100*((h.values(s)-h._valueMin())/(h._valueMax()-h._valueMin())),u["horizontal"===h.orientation?"left":"bottom"]=i+"%",e(this).stop(1,1)[l?"animate":"css"](u,r.animate),h.options.range===!0&&("horizontal"===h.orientation?(0===s&&h.range.stop(1,1)[l?"animate":"css"]({left:i+"%"},r.animate),1===s&&h.range[l?"animate":"css"]({width:i-t+"%"},{queue:!1,duration:r.animate})):(0===s&&h.range.stop(1,1)[l?"animate":"css"]({bottom:i+"%"},r.animate),1===s&&h.range[l?"animate":"css"]({height:i-t+"%"},{queue:!1,duration:r.animate}))),t=i}):(s=this.value(),n=this._valueMin(),a=this._valueMax(),i=a!==n?100*((s-n)/(a-n)):0,u["horizontal"===this.orientation?"left":"bottom"]=i+"%",this.handle.stop(1,1)[l?"animate":"css"](u,r.animate),"min"===o&&"horizontal"===this.orientation&&this.range.stop(1,1)[l?"animate":"css"]({width:i+"%"},r.animate),"max"===o&&"horizontal"===this.orientation&&this.range[l?"animate":"css"]({width:100-i+"%"},{queue:!1,duration:r.animate}),"min"===o&&"vertical"===this.orientation&&this.range.stop(1,1)[l?"animate":"css"]({height:i+"%"},r.animate),"max"===o&&"vertical"===this.orientation&&this.range[l?"animate":"css"]({height:100-i+"%"},{queue:!1,duration:r.animate}))},_handleEvents:{keydown:function(t){var i,s,n,a,o=e(t.target).data("ui-slider-handle-index");switch(t.keyCode){case e.ui.keyCode.HOME:case e.ui.keyCode.END:case e.ui.keyCode.PAGE_UP:case e.ui.keyCode.PAGE_DOWN:case e.ui.keyCode.UP:case e.ui.keyCode.RIGHT:case e.ui.keyCode.DOWN:case e.ui.keyCode.LEFT:if(t.preventDefault(),!this._keySliding&&(this._keySliding=!0,e(t.target).addClass("ui-state-active"),i=this._start(t,o),i===!1))return}switch(a=this.options.step,s=n=this.options.values&&this.options.values.length?this.values(o):this.value(),t.keyCode){case e.ui.keyCode.HOME:n=this._valueMin();break;case e.ui.keyCode.END:n=this._valueMax();break;case e.ui.keyCode.PAGE_UP:n=this._trimAlignValue(s+(this._valueMax()-this._valueMin())/this.numPages);break;case e.ui.keyCode.PAGE_DOWN:n=this._trimAlignValue(s-(this._valueMax()-this._valueMin())/this.numPages);break;case e.ui.keyCode.UP:case e.ui.keyCode.RIGHT:if(s===this._valueMax())return;n=this._trimAlignValue(s+a);break;case e.ui.keyCode.DOWN:case e.ui.keyCode.LEFT:if(s===this._valueMin())return;n=this._trimAlignValue(s-a)}this._slide(t,o,n)},keyup:function(t){var i=e(t.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(t,i),this._change(t,i),e(t.target).removeClass("ui-state-active"))}}})});

      //jQuery UI Touch Punch 0.2.3
      !function(a){function f(a,b){if(!(a.originalEvent.touches.length>1)){a.preventDefault();var c=a.originalEvent.changedTouches[0],d=document.createEvent("MouseEvents");d.initMouseEvent(b,!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(d)}}if(a.support.touch="ontouchend"in document,a.support.touch){var e,b=a.ui.mouse.prototype,c=b._mouseInit,d=b._mouseDestroy;b._touchStart=function(a){var b=this;!e&&b._mouseCapture(a.originalEvent.changedTouches[0])&&(e=!0,b._touchMoved=!1,f(a,"mouseover"),f(a,"mousemove"),f(a,"mousedown"))},b._touchMove=function(a){e&&(this._touchMoved=!0,f(a,"mousemove"))},b._touchEnd=function(a){e&&(f(a,"mouseup"),f(a,"mouseout"),this._touchMoved||f(a,"click"),e=!1)},b._mouseInit=function(){var b=this;b.element.bind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),c.call(b)},b._mouseDestroy=function(){var b=this;b.element.unbind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),d.call(b)}}}($);

      /* https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest */ 
      !function(t){if(t.support.cors||!t.ajaxTransport||!window.XDomainRequest)return t;var e=/^(https?:)?\/\//i,n=/^get|post$/i,o=new RegExp("^(//|"+location.protocol+")","i");return t.ajaxTransport("* text html xml json",function(r,s){if(r.crossDomain&&r.async&&n.test(r.type)&&e.test(r.url)&&o.test(r.url)){var a=null;return{send:function(e,n){var o="",i=(s.dataType||"").toLowerCase();a=new XDomainRequest,/^\d+$/.test(s.timeout)&&(a.timeout=s.timeout),a.ontimeout=function(){n(500,"timeout")},a.onload=function(){var e="Content-Length: "+a.responseText.length+"\r\nContent-Type: "+a.contentType,o={code:200,message:"success"},r={text:a.responseText};try{if("html"===i||/text\/html/i.test(a.contentType))r.html=a.responseText;else if("json"===i||"text"!==i&&/\/json/i.test(a.contentType))try{r.json=t.parseJSON(a.responseText)}catch(s){o.code=500,o.message="parseerror"}else if("xml"===i||"text"!==i&&/\/xml/i.test(a.contentType)){var c=new ActiveXObject("Microsoft.XMLDOM");c.async=!1;try{c.loadXML(a.responseText)}catch(s){c=void 0}if(!c||!c.documentElement||c.getElementsByTagName("parsererror").length)throw o.code=500,o.message="parseerror","Invalid XML: "+a.responseText;r.xml=c}}catch(p){throw p}finally{n(o.code,o.message,r,e)}},a.onprogress=function(){},a.onerror=function(){n(500,"error",{text:a.responseText})},s.data&&(o="string"===t.type(s.data)?s.data:t.param(s.data)),a.open(r.type,r.url),a.send(o)},abort:function(){a&&a.abort()}}}}),t}($);


    // SWFObject
      /*  SWFObject v2.2 <http://code.google.com/p/swfobject/>  */
      var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();


    // Evaporate
      /* Evaporate.js */
      !function(){var e=function(e){function t(e){var t=g.length;return g.push(new a(s({progress:function(){},complete:function(){},cancelled:function(){},info:function(){},warn:function(){},error:function(){}},e,{id:t,status:i,priority:0,onStatusChange:o,loadedBytes:0,sizeBytes:e.file.size}))),t}function o(){v.d("onFileUploadStatusChange"),r()}function n(){setTimeout(r,1)}function r(){v.d("processQueue   length: "+g.length);var e=-1,t=-1,o=!0;g.forEach(function(n,r){n.priority>t&&n.status==i&&(e=r,t=n.priority),n.status==d&&(o=!1)}),o&&e>=0&&g[e].start()}function a(e){function t(e){(e==u||e==p||e==l)&&(clearInterval(T),clearInterval(x)),R.status=e,R.onStatusChange()}function o(){v.d("cancelAllRequests()"),U.forEach(function(e){e.abort()})}function n(){var e={method:"POST",path:B()+"?uploads",step:"initiate",x_amz_headers:R.xAmzHeadersAtInitiate,not_signed_headers:R.notSignedHeadersAtInitiate};R.contentType&&(e.contentType=R.contentType),e.onErr=function(){v.d("onInitiateError for FileUpload "+R.id),t(p)},e.on200=function(t){var o=t.response.match(/<UploadId\>(.+)<\/UploadId\>/);o&&o[1]?(R.uploadId=o[1],v.d("requester success. got uploadId "+R.uploadId),g(),w()):e.onErr()},z(e),b(e)}function r(e){var o,n,r,a;a=_[e],a.status=d,I++,a.loadedBytesPrevious=null,o=0===a.attempts++?0:1e3*Math.min(y.maxRetryBackoffSecs,Math.pow(y.retryBackoffPower,a.attempts-2)),v.d("uploadPart #"+e+"     will wait "+o+"ms to try"),r={method:"PUT",path:B()+"?partNumber="+e+"&uploadId="+R.uploadId,step:"upload #"+e,x_amz_headers:R.xAmzHeadersAtUpload,attempts:a.attempts},r.onErr=function(o,r){var s="problem uploading part #"+e+",   http status: "+o.status+",   hasErrored: "+!!n+",   part status: "+a.status+",   readyState: "+o.readyState+(r?",   isOnError":"");if(v.w(s),R.warn(s),!n){if(n=!0,404==o.status){var i="404 error resulted in abortion of both this part and the entire file.";v.w(i+" Server response: "+o.response),R.error(i),a.status=c,t(c)}else a.status=p,a.loadedBytes=0,w();o.abort()}},r.on200=function(t){var o,n=t.getResponseHeader("ETag");v.d("uploadPart 200 response for part #"+e+"     ETag: "+n),a.isEmpty||n!=h?(a.eTag=n,a.status=u):(a.status=p,a.loadedBytes=0,o="eTag matches MD5 of 0 length blob for part #"+e+"   Retrying part.",v.w(o),R.warn(o)),w()},r.onProgress=function(e){a.loadedBytes=e.loaded};var s=R.file.slice?"slice":R.file.mozSlice?"mozSlice":"webkitSlice";r.toSend=function(){var t=R.file[s](a.start,a.end);return v.d("sending part # "+e+" (bytes "+a.start+" -> "+a.end+")  reported length: "+t.size),a.isEmpty||0!==t.size||v.w("  *** WARN: blob reporting size of 0 bytes. Will try upload anyway.."),t},r.onFailedAuth=function(){var t="onFailedAuth for uploadPart #"+e+".   Will set status to ERROR";v.w(t),R.warn(t),a.status=p,a.loadedBytes=0,w()},z(r),setTimeout(function(){b(r),v.d("upload #",e,r)},o),a.uploader=r}function a(e){var t=_[e];t.uploader.awsXhr&&t.uploader.awsXhr.abort(),t.uploader.authXhr&&t.uploader.authXhr.abort()}function m(){v.d("completeUpload"),R.info("will attempt to complete upload");var e="<CompleteMultipartUpload>";_.forEach(function(t,o){t&&(e+="<Part><PartNumber>"+o+"</PartNumber><ETag>"+t.eTag+"</ETag></Part>")}),e+="</CompleteMultipartUpload>";var o={method:"POST",contentType:"application/xml; charset=UTF-8",path:B()+"?uploadId="+R.uploadId,x_amz_headers:R.xAmzHeadersAtComplete,step:"complete"};o.onErr=function(){var e="Error completing upload.";v.w(e),R.error(e),t(p)},o.on200=function(e){R.complete(e),t(u)},o.toSend=function(){return e},z(o),b(o)}function g(){for(var e=Math.ceil(R.file.size/y.partSize)||1,t=1;e>=t;t++)_[t]={status:i,start:(t-1)*y.partSize,end:t*y.partSize,attempts:0,loadedBytes:0,loadedBytesPrevious:null,isEmpty:0===R.file.size}}function w(){var e,t=0,o=!0,n=!1,a=[],s=[];return R.status!=d?void R.info("will not process parts list, as not currently evaporating"):(_.forEach(function(e,u){var l=!1;if(a.push(e.status),e){switch(e.status){case d:o=!1,t++,s.push(e.loadedBytes);break;case p:n=!0,l=!0;break;case i:l=!0}l&&(o=!1,t<y.maxConcurrentParts&&(r(u),t++))}}),e=a.toString()+" // bytesLoaded: "+s.toString(),v.d("processPartsList()  anyPartHasErrored: "+n,e),(I>=_.length-1||n)&&R.info("part stati: "+e),void(o&&m()))}function S(){T=setInterval(function(){var e=0;_.forEach(function(t){e+=t.loadedBytes}),R.progress(e/R.sizeBytes)},y.progressIntervalMS)}function P(){x=setInterval(function(){v.d("monitorPartsProgress() "+Date()),_.forEach(function(e,t){var o;return e.status!=d?void v.d(t,"not evaporating "):null===e.loadedBytesPrevious?(v.d(t,"no previous "),void(e.loadedBytesPrevious=e.loadedBytes)):(o=e.loadedBytesPrevious<e.loadedBytes,y.simulateStalling&&4==t&&Math.random()<.25&&(o=!1),v.d(t,o?"moving. ":"stalled.",e.loadedBytesPrevious,e.loadedBytes),o||setTimeout(function(){R.info("part #"+t+" stalled. will abort. "+e.loadedBytesPrevious+" "+e.loadedBytes),a(t)},0),void(e.loadedBytesPrevious=e.loadedBytes))})},12e4)}function z(e){if(v.d("setupRequest()",e),y.timeUrl){var t=new XMLHttpRequest;t.open("GET",y.timeUrl+"?requestTime="+(new Date).getTime(),!1),t.send(),e.dateString=t.responseText}else e.dateString=(new Date).toUTCString();e.x_amz_headers=s(e.x_amz_headers,{"x-amz-date":e.dateString}),e.onGotAuth=function(){var t=new XMLHttpRequest;U.push(t),e.awsXhr=t;var o=e.toSend?e.toSend():null,n=f+e.path,r={};s(r,e.not_signed_headers),s(r,e.x_amz_headers),y.simulateErrors&&1==e.attempts&&"upload #3"==e.step&&(v.d("simulating error by POST part #3 to invalid url"),n="https:///foo"),t.open(e.method,n),t.setRequestHeader("Authorization","AWS "+y.aws_key+":"+e.auth);for(var a in r)r.hasOwnProperty(a)&&t.setRequestHeader(a,r[a]);e.contentType&&t.setRequestHeader("Content-Type",e.contentType),t.onreadystatechange=function(){4==t.readyState&&(o&&v.d("  ### "+o.size),200==t.status?e.on200(t):e.onErr(t))},t.onerror=function(){e.onErr(t,!0)},"function"==typeof e.onProgress&&(t.upload.onprogress=function(t){e.onProgress(t)}),t.send(o)},e.onFailedAuth=e.onFailedAuth||function(t){R.error("Error onFailedAuth for step: "+e.step),e.onErr(t)}}function b(e){v.d("authorizedSend() "+e.step);var t=new XMLHttpRequest;U.push(t),e.authXhr=t;var o,n=y.signerUrl+"?to_sign="+E(e);for(var r in R.signParams)R.signParams.hasOwnProperty(r)&&(n+=R.signParams[r]instanceof Function?"&"+encodeURIComponent(r)+"="+encodeURIComponent(R.signParams[r]()):"&"+encodeURIComponent(r)+"="+encodeURIComponent(R.signParams[r]));for(var a in R.signHeaders)R.signHeaders.hasOwnProperty(a)&&(R.signHeaders[a]instanceof Function?t.setRequestHeader(a,R.signHeaders[a]()):t.setRequestHeader(a,R.signHeaders[a]));t.onreadystatechange=function(){4==t.readyState&&(200==t.status&&28==t.response.length?(v.d("authorizedSend got signature for step: '"+e.step+"'    sig: "+t.response),e.auth=t.response,e.onGotAuth()):(o="failed to get authorization (readyState=4) for "+e.step+".  xhr.status: "+t.status+".  xhr.response: "+t.response,v.w(o),R.warn(o),e.onFailedAuth(t)))},t.onerror=function(){o="failed to get authorization (onerror) for "+e.step+".  xhr.status: "+t.status+".  xhr.response: "+t.response,v.w(o),R.warn(o),e.onFailedAuth(t)},t.open("GET",n),R.beforeSigner instanceof Function&&R.beforeSigner(t),t.send()}function E(e){var t,o="",n=[];for(var r in e.x_amz_headers)e.x_amz_headers.hasOwnProperty(r)&&n.push(r);return n.sort(),n.forEach(function(t){o+=t+":"+e.x_amz_headers[t]+"\n"}),t=e.method+"\n\n"+(e.contentType||"")+"\n\n"+o+(y.cloudfront?"/"+y.bucket:"")+e.path,encodeURIComponent(t)}function B(){var e="/"+y.bucket+"/"+R.name;return(y.cloudfront||f.indexOf("cloudfront")>-1)&&(e="/"+R.name),e}var T,x,R=this,_=[],I=0,U=[];s(R,e),R.start=function(){v.d("starting FileUpload "+R.id),t(d),n(),S(),P()},R.stop=function(){v.d("stopping FileUpload ",R.id),R.cancelled(),R.info("upload canceled"),t(l),o()}}function s(e,t,o){if("undefined"==typeof e&&(e={}),"object"==typeof o)for(var n in o)t[n]=o[n];for(var r in t)e[r]=t[r];return e}if(this.supported=!("undefined"==typeof File||"undefined"==typeof Blob||!(Blob.prototype.webkitSlice||Blob.prototype.mozSlice||Blob.prototype.slice)||e.testUnsupported),this.supported){var i=0,d=2,u=3,l=5,p=10,c=20,f=e.aws_url||"https://s3.amazonaws.com",h='"d41d8cd98f00b204e9800998ecf8427e"',m=this,g=[],y=s({logging:!0,maxConcurrentParts:5,partSize:6291456,retryBackoffPower:2,maxRetryBackoffSecs:300,progressIntervalMS:500,cloudfront:!1,encodeFilename:!0},e);m.add=function(e){v.d("add");var o;if("undefined"==typeof e)return"Missing file";if("undefined"==typeof e.name?o="Missing attribute: name  ":y.encodeFilename&&(e.name=encodeURIComponent(e.name)),o)return o;var r=t(e);return n(),r},m.cancel=function(e){return v.d("cancel ",e),g[e]?(g[e].stop(),!0):!1},m.pause=function(){},m.resume=function(){},m.forceRetry=function(){};var v={d:function(){},w:function(){},e:function(){}};y.logging&&console&&console.log&&(v=console,v.d=v.log,v.w=console.warn?v.warn:v.log,v.e=console.error?v.error:v.log)}};"undefined"!=typeof module&&module.exports?module.exports=e:"undefined"!=typeof window&&(window.Evaporate=e)}();


    // International Tel Input
      /*https://github.com/Bluefieldscom/intl-tel-input.git */
      (function(a,b,c,d){"use strict";function e(b,c){this.a=b,c&&(a.extend(c, c, {a:c.autoFormat,h:c.autoHideDialCode,d:c.defaultCountry,i:c.ipinfoToken,n:c.nationalMode,t:c.numberType,o:c.onlyCountries,p:c.preferredCountries,v:c.preventInvalidNumbers,u:c.utilsScript})),this.b=a.extend({},h,c),this.c=h,this.ns="."+f+g++,this.d=Boolean(b.setSelectionRange),this.e=Boolean(a(b).attr("placeholder")),this.f=f}var f="intlTelInput",g=1,h={allowExtensions:!1,a:!0,h:!0,autoPlaceholder:!0,d:"",geoIpLookup:null,n:!0,t:"MOBILE",o:[],p:["us","gb"],u:""},i={b:38,c:40,d:13,e:27,f:43,A:65,Z:90,g:48,h:57,i:32,Bi:8,TAB:9,k:46,l:17,m:91,n:224},j=!1;a(b).load(function(){j=!0}),e.prototype={_init:function(){return this.b.n&&(this.b.h=!1),navigator.userAgent.match(/IEMobile/i)&&(this.b.a=!1),this.isMobile=/Android.+Mobile|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),this.autoCountryDeferred=new a.Deferred,this.utilsScriptDeferred=new a.Deferred,this._b(),this._f(),this._h(),this._i(),this._initRequests(),[this.autoCountryDeferred,this.utilsScriptDeferred]},_b:function(){this._d(),this._e()},_c:function(a,b,c){b in this.m||(this.m[b]=[]);var d=c||0;this.m[b][d]=a},_d:function(){var b;if(this.b.o.length){for(b=0;b<this.b.o.length;b++)this.b.o[b]=this.b.o[b].toLowerCase();for(this.l=[],b=0;b<k.length;b++)-1!=a.inArray(k[b].iso2,this.b.o)&&this.l.push(k[b])}else this.l=k;for(this.m={},b=0;b<this.l.length;b++){var c=this.l[b];if(this._c(c.iso2,c.dialCode,c.priority),c.areaCodes)for(var d=0;d<c.areaCodes.length;d++)this._c(c.iso2,c.dialCode+c.areaCodes[d])}},_e:function(){this.n=[];for(var a=0;a<this.b.p.length;a++){var b=this.b.p[a].toLowerCase(),c=this._y(b,!1,!0);c&&this.n.push(c)}},_f:function(){this.g=a(this.a),this.g.attr("autocomplete","off"),this.g.wrap(a("<div>",{"class":"intl-tel-input"})),this.flagsContainer=a("<div>",{"class":"flag-dropdown"}).insertBefore(this.g);var b=a("<div>",{tabindex:"0","class":"selected-flag"}).appendTo(this.flagsContainer);this.h=a("<div>",{"class":"iti-flag"}).appendTo(b),a("<div>",{"class":"arrow"}).appendTo(b),this.isMobile?this.i=a("<select>",{"class":"iti-mobile-select"}).appendTo(this.flagsContainer):(this.i=a("<ul>",{"class":"country-list v-hide"}).appendTo(this.flagsContainer),this.n.length&&!this.isMobile&&(this._g(this.n,"preferred"),a("<li>",{"class":"divider"}).appendTo(this.i))),this._g(this.l,""),this.isMobile||(this.j=this.i.outerHeight(),this.i.removeClass("v-hide").addClass("hide"),this.k=this.i.children(".country"))},_g:function(a,b){for(var c="",d=0;d<a.length;d++){var e=a[d];this.isMobile?(c+="<option data-dial-code='"+e.dialCode+"' value='"+e.iso2+"'>",c+=e.name+" +"+e.dialCode,c+="</option>"):(c+="<li class='country "+b+"' data-dial-code='"+e.dialCode+"' data-country-code='"+e.iso2+"'>",c+="<div class='flag'><div class='iti-flag "+e.iso2+"'></div></div>",c+="<span class='country-name'>"+e.name+"</span>",c+="<span class='dial-code'>+"+e.dialCode+"</span>",c+="</li>")}this.i.append(c)},_h:function(){var a=this.g.val();this._af(a)?this._v(a,!0):"auto"!=this.b.d&&(this.b.d=this.b.d?this._y(this.b.d.toLowerCase(),!1,!1):this.n.length?this.n[0]:this.l[0],this._z(this.b.d.iso2),a||this._ae(this.b.d.dialCode,!1)),a&&this._u(a)},_i:function(){var b=this;if(this._j(),(this.b.h||this.b.a)&&this._l(),this.isMobile)this.i.on("change"+this.ns,function(){b._ab(a(this).find("option:selected"))});else{var c=this.g.closest("label");c.length&&c.on("click"+this.ns,function(a){b.i.hasClass("hide")?b.g.focus():a.preventDefault()});var d=this.h.parent();d.on("click"+this.ns,function(){!b.i.hasClass("hide")||b.g.prop("disabled")||b.g.prop("readonly")||b._n()})}this.flagsContainer.on("keydown"+b.ns,function(a){var c=b.i.hasClass("hide");!c||a.which!=i.b&&a.which!=i.c&&a.which!=i.i&&a.which!=i.d||(a.preventDefault(),a.stopPropagation(),b._n()),a.which==i.TAB&&b._ac()})},_initRequests:function(){var c=this;this.b.u?j?this.loadUtils():a(b).load(function(){c.loadUtils()}):this.utilsScriptDeferred.resolve(),"auto"==this.b.d?this._loadAutoCountry():this.autoCountryDeferred.resolve()},_loadAutoCountry:function(){var b=a.cookie?a.cookie("itiAutoCountry"):"";b&&(a.fn[f].autoCountry=b),a.fn[f].autoCountry?this.autoCountryLoaded():a.fn[f].startedLoadingAutoCountry||(a.fn[f].startedLoadingAutoCountry=!0,"function"==typeof this.b.geoIpLookup&&this.b.geoIpLookup(function(b){a.fn[f].autoCountry=b.toLowerCase(),a.cookie&&a.cookie("itiAutoCountry",a.fn[f].autoCountry,{path:"/"}),setTimeout(function(){a(".intl-tel-input input").intlTelInput("autoCountryLoaded")})}))},_j:function(){var a=this;this.b.a&&this.g.on("keypress"+this.ns,function(c){if(c.which>=i.i&&!c.ctrlKey&&!c.metaKey&&b.intlTelInputUtils&&!a.g.prop("readonly")){c.preventDefault();var d=c.which>=i.g&&c.which<=i.h||c.which==i.f,e=a.g[0],f=a.d&&e.selectionStart==e.selectionEnd,g=a.g.attr("maxlength"),h=a.g.val(),j=g?h.length<g:!0;if(j&&(d||f)){var k=d?String.fromCharCode(c.which):null;a._k(k,!0,d),h!=a.g.val()&&a.g.trigger("input")}d||a._handleInvalidKey()}}),this.g.on("cut"+this.ns+" paste"+this.ns,function(){setTimeout(function(){if(a.b.a&&b.intlTelInputUtils){var c=a.d&&a.g[0].selectionStart==a.g.val().length;a._k(null,c),a._ensurePlus()}else a._v(a.g.val())})}),this.g.on("keyup"+this.ns,function(c){if(c.which==i.d||a.g.prop("readonly"));else if(a.b.a&&b.intlTelInputUtils){var d=a.d&&a.g[0].selectionStart==a.g.val().length;a.g.val()?(c.which==i.k&&!d||c.which==i.Bi)&&a._k():a._v(""),a._ensurePlus()}else a._v(a.g.val())})},_ensurePlus:function(){if(!this.b.n){var a=this.g.val(),b=this.g[0];if("+"!=a.charAt(0)){var c=this.d?b.selectionStart+1:0;this.g.val("+"+a),this.d&&b.setSelectionRange(c,c)}}},_handleInvalidKey:function(){var a=this;this.g.trigger("invalidkey").addClass("iti-invalid-key"),setTimeout(function(){a.g.removeClass("iti-invalid-key")},100)},_k:function(a,b,c){var d,e=this.g.val(),f=(this._getClean(e),this.g[0]),g=0;if(this.d?(g=this._getDigitsOnRight(e,f.selectionEnd),a?e=e.substr(0,f.selectionStart)+a+e.substring(f.selectionEnd,e.length):d=e.substr(f.selectionStart-2,2)):a&&(e+=a),this.setNumber(e,null,b,!0,c),this.d){var h;e=this.g.val(),g?(h=this._getCursorFromDigitsOnRight(e,g),a||(h=this._getCursorFromLeftChar(e,h,d))):h=e.length,f.setSelectionRange(h,h)}},_getCursorFromLeftChar:function(b,c,d){for(var e=c;e>0;e--){var f=b.charAt(e-1);if(a.isNumeric(f)||b.substr(e-2,2)==d)return e}return 0},_getCursorFromDigitsOnRight:function(b,c){for(var d=b.length-1;d>=0;d--)if(a.isNumeric(b.charAt(d))&&0===--c)return d;return 0},_getDigitsOnRight:function(b,c){for(var d=0,e=c;e<b.length;e++)a.isNumeric(b.charAt(e))&&d++;return d},_l:function(){var a=this;this.b.h&&this.g.on("mousedown"+this.ns,function(b){a.g.is(":focus")||a.g.val()||(b.preventDefault(),a.g.focus())}),this.g.on("focus"+this.ns,function(){var c=a.g.val();a.g.data("focusVal",c),a.b.h&&!c&&!a.g.prop("readonly")&&a.o.dialCode&&(a._u("+"+a.o.dialCode,null,!0),a.g.one("keypress.plus"+a.ns,function(c){if(c.which==i.f){var d=a.b.a&&b.intlTelInputUtils?"+":"";a.g.val(d)}}),setTimeout(function(){var b=a.g[0];if(a.d){var c=a.g.val().length;b.setSelectionRange(c,c)}}))}),this.g.on("blur"+this.ns,function(){if(a.b.h){var c=a.g.val(),d="+"==c.charAt(0);if(d){var e=a._m(c);e&&a.o.dialCode!=e||a.g.val("")}a.g.off("keypress.plus"+a.ns)}a.b.a&&b.intlTelInputUtils&&a.g.val()!=a.g.data("focusVal")&&a.g.trigger("change")})},_m:function(a){return a.replace(/\D/g,"")},_getClean:function(a){var b="+"==a.charAt(0)?"+":"";return b+this._m(a)},_n:function(){this._o();var a=this.i.children(".active");a.length&&this._x(a),this.i.removeClass("hide"),a.length&&this._ad(a),this._p(),this.h.children(".arrow").addClass("up")},_o:function(){var c=this.g.offset().top,d=a(b).scrollTop(),e=c+this.g.outerHeight()+this.j<d+a(b).height(),f=c-this.j>d,g=!e&&f?"-"+(this.j-1)+"px":"";this.i.css("top",g)},_p:function(){var b=this;this.i.on("mouseover"+this.ns,".country",function(){b._x(a(this))}),this.i.on("click"+this.ns,".country",function(){b._ab(a(this))});var d=!0;a("html").on("click"+this.ns,function(){d||b._ac(),d=!1});var e="",f=null;a(c).on("keydown"+this.ns,function(a){a.preventDefault(),a.which==i.b||a.which==i.c?b._q(a.which):a.which==i.d?b._r():a.which==i.e?b._ac():(a.which>=i.A&&a.which<=i.Z||a.which==i.i)&&(f&&clearTimeout(f),e+=String.fromCharCode(a.which),b._s(e),f=setTimeout(function(){e=""},1e3))})},_q:function(a){var b=this.i.children(".highlight").first(),c=a==i.b?b.prev():b.next();c.length&&(c.hasClass("divider")&&(c=a==i.b?c.prev():c.next()),this._x(c),this._ad(c))},_r:function(){var a=this.i.children(".highlight").first();a.length&&this._ab(a)},_s:function(a){for(var b=0;b<this.l.length;b++)if(this._t(this.l[b].name,a)){var c=this.i.children("[data-country-code="+this.l[b].iso2+"]").not(".preferred");this._x(c),this._ad(c,!0);break}},_t:function(a,b){return a.substr(0,b.length).toUpperCase()==b},_u:function(a,c,d,e,f){var g;if(this.b.a&&b.intlTelInputUtils&&this.o){g="number"==typeof c&&intlTelInputUtils.isValidNumber(a,this.o.iso2)?intlTelInputUtils.formatNumberByType(a,this.o.iso2,c):!e&&this.b.n&&"+"==a.charAt(0)&&intlTelInputUtils.isValidNumber(a,this.o.iso2)?intlTelInputUtils.formatNumberByType(a,this.o.iso2,intlTelInputUtils.numberFormat.NATIONAL):intlTelInputUtils.formatNumber(a,this.o.iso2,d,this.b.allowExtensions,f);var h=this.g.attr("maxlength");h&&g.length>h&&(g=g.substr(0,h))}else g=a;this.g.val(g)},_v:function(b,c){b&&this.b.n&&this.o&&"1"==this.o.dialCode&&"+"!=b.charAt(0)&&("1"!=b.charAt(0)&&(b="1"+b),b="+"+b);var d=this._af(b),e=null;if(d){var f=this.m[this._m(d)],g=this.o&&-1!=a.inArray(this.o.iso2,f);if(!g||this._w(b,d))for(var h=0;h<f.length;h++)if(f[h]){e=f[h];break}}else"+"==b.charAt(0)&&this._m(b).length?e="":b&&"+"!=b||(e=this.b.d.iso2);null!==e&&this._z(e,c)},_w:function(a,b){return"+1"==b&&this._m(a).length>=4},_x:function(a){this.k.removeClass("highlight"),a.addClass("highlight")},_y:function(a,b,c){for(var d=b?k:this.l,e=0;e<d.length;e++)if(d[e].iso2==a)return d[e];if(c)return null;throw new Error("No country data for '"+a+"'")},_z:function(a,b){this.o=a?this._y(a,!1,!1):{},b&&this.o.iso2&&(this.b.d={iso2:this.o.iso2}),this.h.attr("class","iti-flag "+a);var c=a?this.o.name+": +"+this.o.dialCode:"Unknown";this.h.parent().attr("title",c),this._aa(),this.isMobile?this.i.val(a):(this.k.removeClass("active"),a&&this.k.find(".iti-flag."+a).first().closest(".country").addClass("active"))},_aa:function(){if(b.intlTelInputUtils&&!this.e&&this.b.autoPlaceholder&&this.o){var a=this.o.iso2,c=intlTelInputUtils.numberType[this.b.t||"FIXED_LINE"],d=a?intlTelInputUtils.getExampleNumber(a,this.b.n,c):"";this.g.attr("placeholder",d)}},_ab:function(a){var b=this.isMobile?"value":"data-country-code";if(this._z(a.attr(b),!0),this.isMobile||this._ac(),this._ae(a.attr("data-dial-code"),!0),this.g.trigger("change"),this.g.focus(),this.d){var c=this.g.val().length;this.g[0].setSelectionRange(c,c)}},_ac:function(){this.i.addClass("hide"),this.h.children(".arrow").removeClass("up"),a(c).off(this.ns),a("html").off(this.ns),this.i.off(this.ns)},_ad:function(a,b){var c=this.i,d=c.height(),e=c.offset().top,f=e+d,g=a.outerHeight(),h=a.offset().top,i=h+g,j=h-e+c.scrollTop(),k=d/2-g/2;if(e>h)b&&(j-=k),c.scrollTop(j);else if(i>f){b&&(j+=k);var l=d-g;c.scrollTop(j-l)}},_ae:function(b,c){var d,e=this.g.val();if(b="+"+b,this.b.n&&"+"!=e.charAt(0))d=e;else if(e){var f=this._af(e);if(f.length>1)d=e.replace(f,b);else{var g="+"!=e.charAt(0)?a.trim(e):"";d=b+g}}else d=!this.b.h||c?b:"";this._u(d,null,c)},_af:function(b){var c="";if("+"==b.charAt(0))for(var d="",e=0;e<b.length;e++){var f=b.charAt(e);if(a.isNumeric(f)&&(d+=f,this.m[d]&&(c=b.substr(0,e+1)),4==d.length))break}return c},autoCountryLoaded:function(){"auto"==this.b.d&&(this.b.d=a.fn[f].autoCountry,this._h(),this.autoCountryDeferred.resolve())},destroy:function(){this.isMobile||this._ac(),this.g.off(this.ns),this.isMobile?this.i.off(this.ns):(this.h.parent().off(this.ns),this.g.closest("label").off(this.ns));var a=this.g.parent();a.before(this.g).remove()},getExtension:function(){return this.g.val().split(" ext. ")[1]||""},getNumber:function(a){return b.intlTelInputUtils?intlTelInputUtils.formatNumberByType(this.g.val(),this.o.iso2,a):""},getNumberType:function(){return b.intlTelInputUtils?intlTelInputUtils.getNumberType(this.g.val(),this.o.iso2):-99},getSelectedCountryData:function(){return this.o||{}},getValidationError:function(){return b.intlTelInputUtils?intlTelInputUtils.getValidationError(this.g.val(),this.o.iso2):-99},isValidNumber:function(){var c=a.trim(this.g.val()),d=this.b.n?this.o.iso2:"";return b.intlTelInputUtils?intlTelInputUtils.isValidNumber(c,d):!1},loadUtils:function(b){var c=this,d=b||this.b.u;!a.fn[f].loadedUtilsScript&&d?(a.fn[f].loadedUtilsScript=!0,a.ajax({url:d,success:function(){a(".intl-tel-input input").intlTelInput("utilsLoaded")},complete:function(){c.utilsScriptDeferred.resolve()},dataType:"script",cache:!0})):this.utilsScriptDeferred.resolve()},selectCountry:function(a){a=a.toLowerCase(),this.h.hasClass(a)||(this._z(a,!0),this._ae(this.o.dialCode,!1))},setNumber:function(a,b,c,d,e){this.b.n||"+"==a.charAt(0)||(a="+"+a),this._v(a),this._u(a,b,c,d,e)},utilsLoaded:function(){this.b.a&&this.g.val()&&this._u(this.g.val()),this._aa()}},a.fn[f]=function(b){var c=arguments;if(b===d||"object"==typeof b){var g=[];return this.each(function(){if(!a.data(this,"plugin_"+f)){var c=new e(this,b),d=c._init();g.push(d[0]),g.push(d[1]),a.data(this,"plugin_"+f,c)}}),a.when.apply(null,g)}if("string"==typeof b&&"_"!==b[0]){var h;return this.each(function(){var d=a.data(this,"plugin_"+f);d instanceof e&&"function"==typeof d[b]&&(h=d[b].apply(d,Array.prototype.slice.call(c,1))),"destroy"===b&&a.data(this,"plugin_"+f,null)}),h!==d?h:this}},a.fn[f].getCountryData=function(){return k},a.fn[f].version="6.0.6";for(var k=[["Afghanistan (‫افغانستان‬‎)","af","93"],["Albania (Shqipëri)","al","355"],["Algeria (‫الجزائر‬‎)","dz","213"],["American Samoa","as","1684"],["Andorra","ad","376"],["Angola","ao","244"],["Anguilla","ai","1264"],["Antigua and Barbuda","ag","1268"],["Argentina","ar","54"],["Armenia (Հայաստան)","am","374"],["Aruba","aw","297"],["Australia","au","61"],["Austria (Österreich)","at","43"],["Azerbaijan (Azərbaycan)","az","994"],["Bahamas","bs","1242"],["Bahrain (‫البحرين‬‎)","bh","973"],["Bangladesh (বাংলাদেশ)","bd","880"],["Barbados","bb","1246"],["Belarus (Беларусь)","by","375"],["Belgium (België)","be","32"],["Belize","bz","501"],["Benin (Bénin)","bj","229"],["Bermuda","bm","1441"],["Bhutan (འབྲུག)","bt","975"],["Bolivia","bo","591"],["Bosnia and Herzegovina (Босна и Херцеговина)","ba","387"],["Botswana","bw","267"],["Brazil (Brasil)","br","55"],["British Indian Ocean Territory","io","246"],["British Virgin Islands","vg","1284"],["Brunei","bn","673"],["Bulgaria (България)","bg","359"],["Burkina Faso","bf","226"],["Burundi (Uburundi)","bi","257"],["Cambodia (កម្ពុជា)","kh","855"],["Cameroon (Cameroun)","cm","237"],["Canada","ca","1",1,["204","226","236","249","250","289","306","343","365","387","403","416","418","431","437","438","450","506","514","519","548","579","581","587","604","613","639","647","672","705","709","742","778","780","782","807","819","825","867","873","902","905"]],["Cape Verde (Kabu Verdi)","cv","238"],["Caribbean Netherlands","bq","599",1],["Cayman Islands","ky","1345"],["Central African Republic (République centrafricaine)","cf","236"],["Chad (Tchad)","td","235"],["Chile","cl","56"],["China (中国)","cn","86"],["Colombia","co","57"],["Comoros (‫جزر القمر‬‎)","km","269"],["Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)","cd","243"],["Congo (Republic) (Congo-Brazzaville)","cg","242"],["Cook Islands","ck","682"],["Costa Rica","cr","506"],["Côte d’Ivoire","ci","225"],["Croatia (Hrvatska)","hr","385"],["Cuba","cu","53"],["Curaçao","cw","599",0],["Cyprus (Κύπρος)","cy","357"],["Czech Republic (Česká republika)","cz","420"],["Denmark (Danmark)","dk","45"],["Djibouti","dj","253"],["Dominica","dm","1767"],["Dominican Republic (República Dominicana)","do","1",2,["809","829","849"]],["Ecuador","ec","593"],["Egypt (‫مصر‬‎)","eg","20"],["El Salvador","sv","503"],["Equatorial Guinea (Guinea Ecuatorial)","gq","240"],["Eritrea","er","291"],["Estonia (Eesti)","ee","372"],["Ethiopia","et","251"],["Falkland Islands (Islas Malvinas)","fk","500"],["Faroe Islands (Føroyar)","fo","298"],["Fiji","fj","679"],["Finland (Suomi)","fi","358"],["France","fr","33"],["French Guiana (Guyane française)","gf","594"],["French Polynesia (Polynésie française)","pf","689"],["Gabon","ga","241"],["Gambia","gm","220"],["Georgia (საქართველო)","ge","995"],["Germany (Deutschland)","de","49"],["Ghana (Gaana)","gh","233"],["Gibraltar","gi","350"],["Greece (Ελλάδα)","gr","30"],["Greenland (Kalaallit Nunaat)","gl","299"],["Grenada","gd","1473"],["Guadeloupe","gp","590",0],["Guam","gu","1671"],["Guatemala","gt","502"],["Guinea (Guinée)","gn","224"],["Guinea-Bissau (Guiné Bissau)","gw","245"],["Guyana","gy","592"],["Haiti","ht","509"],["Honduras","hn","504"],["Hong Kong (香港)","hk","852"],["Hungary (Magyarország)","hu","36"],["Iceland (Ísland)","is","354"],["India (भारत)","in","91"],["Indonesia","id","62"],["Iran (‫ایران‬‎)","ir","98"],["Iraq (‫العراق‬‎)","iq","964"],["Ireland","ie","353"],["Israel (‫ישראל‬‎)","il","972"],["Italy (Italia)","it","39",0],["Jamaica","jm","1876"],["Japan (日本)","jp","81"],["Jordan (‫الأردن‬‎)","jo","962"],["Kazakhstan (Казахстан)","kz","7",1],["Kenya","ke","254"],["Kiribati","ki","686"],["Kuwait (‫الكويت‬‎)","kw","965"],["Kyrgyzstan (Кыргызстан)","kg","996"],["Laos (ລາວ)","la","856"],["Latvia (Latvija)","lv","371"],["Lebanon (‫لبنان‬‎)","lb","961"],["Lesotho","ls","266"],["Liberia","lr","231"],["Libya (‫ليبيا‬‎)","ly","218"],["Liechtenstein","li","423"],["Lithuania (Lietuva)","lt","370"],["Luxembourg","lu","352"],["Macau (澳門)","mo","853"],["Macedonia (FYROM) (Македонија)","mk","389"],["Madagascar (Madagasikara)","mg","261"],["Malawi","mw","265"],["Malaysia","my","60"],["Maldives","mv","960"],["Mali","ml","223"],["Malta","mt","356"],["Marshall Islands","mh","692"],["Martinique","mq","596"],["Mauritania (‫موريتانيا‬‎)","mr","222"],["Mauritius (Moris)","mu","230"],["Mexico (México)","mx","52"],["Micronesia","fm","691"],["Moldova (Republica Moldova)","md","373"],["Monaco","mc","377"],["Mongolia (Монгол)","mn","976"],["Montenegro (Crna Gora)","me","382"],["Montserrat","ms","1664"],["Morocco (‫المغرب‬‎)","ma","212"],["Mozambique (Moçambique)","mz","258"],["Myanmar (Burma) (မြန်မာ)","mm","95"],["Namibia (Namibië)","na","264"],["Nauru","nr","674"],["Nepal (नेपाल)","np","977"],["Netherlands (Nederland)","nl","31"],["New Caledonia (Nouvelle-Calédonie)","nc","687"],["New Zealand","nz","64"],["Nicaragua","ni","505"],["Niger (Nijar)","ne","227"],["Nigeria","ng","234"],["Niue","nu","683"],["Norfolk Island","nf","672"],["North Korea (조선 민주주의 인민 공화국)","kp","850"],["Northern Mariana Islands","mp","1670"],["Norway (Norge)","no","47"],["Oman (‫عُمان‬‎)","om","968"],["Pakistan (‫پاکستان‬‎)","pk","92"],["Palau","pw","680"],["Palestine (‫فلسطين‬‎)","ps","970"],["Panama (Panamá)","pa","507"],["Papua New Guinea","pg","675"],["Paraguay","py","595"],["Peru (Perú)","pe","51"],["Philippines","ph","63"],["Poland (Polska)","pl","48"],["Portugal","pt","351"],["Puerto Rico","pr","1",3,["787","939"]],["Qatar (‫قطر‬‎)","qa","974"],["Réunion (La Réunion)","re","262"],["Romania (România)","ro","40"],["Russia (Россия)","ru","7",0],["Rwanda","rw","250"],["Saint Barthélemy (Saint-Barthélemy)","bl","590",1],["Saint Helena","sh","290"],["Saint Kitts and Nevis","kn","1869"],["Saint Lucia","lc","1758"],["Saint Martin (Saint-Martin (partie française))","mf","590",2],["Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)","pm","508"],["Saint Vincent and the Grenadines","vc","1784"],["Samoa","ws","685"],["San Marino","sm","378"],["São Tomé and Príncipe (São Tomé e Príncipe)","st","239"],["Saudi Arabia (‫المملكة العربية السعودية‬‎)","sa","966"],["Senegal (Sénégal)","sn","221"],["Serbia (Србија)","rs","381"],["Seychelles","sc","248"],["Sierra Leone","sl","232"],["Singapore","sg","65"],["Sint Maarten","sx","1721"],["Slovakia (Slovensko)","sk","421"],["Slovenia (Slovenija)","si","386"],["Solomon Islands","sb","677"],["Somalia (Soomaaliya)","so","252"],["South Africa","za","27"],["South Korea (대한민국)","kr","82"],["South Sudan (‫جنوب السودان‬‎)","ss","211"],["Spain (España)","es","34"],["Sri Lanka (ශ්‍රී ලංකාව)","lk","94"],["Sudan (‫السودان‬‎)","sd","249"],["Suriname","sr","597"],["Swaziland","sz","268"],["Sweden (Sverige)","se","46"],["Switzerland (Schweiz)","ch","41"],["Syria (‫سوريا‬‎)","sy","963"],["Taiwan (台灣)","tw","886"],["Tajikistan","tj","992"],["Tanzania","tz","255"],["Thailand (ไทย)","th","66"],["Timor-Leste","tl","670"],["Togo","tg","228"],["Tokelau","tk","690"],["Tonga","to","676"],["Trinidad and Tobago","tt","1868"],["Tunisia (‫تونس‬‎)","tn","216"],["Turkey (Türkiye)","tr","90"],["Turkmenistan","tm","993"],["Turks and Caicos Islands","tc","1649"],["Tuvalu","tv","688"],["U.S. Virgin Islands","vi","1340"],["Uganda","ug","256"],["Ukraine (Україна)","ua","380"],["United Arab Emirates (‫الإمارات العربية المتحدة‬‎)","ae","971"],["United Kingdom","gb","44"],["United States","us","1",0],["Uruguay","uy","598"],["Uzbekistan (Oʻzbekiston)","uz","998"],["Vanuatu","vu","678"],["Vatican City (Città del Vaticano)","va","39",1],["Venezuela","ve","58"],["Vietnam (Việt Nam)","vn","84"],["Wallis and Futuna","wf","681"],["Yemen (‫اليمن‬‎)","ye","967"],["Zambia","zm","260"],["Zimbabwe","zw","263"]],l=0;l<k.length;l++){var m=k[l];k[l]={name:m[0],iso2:m[1],dialCode:m[2],priority:m[3]||0,areaCodes:m[4]||null}}})($, window, document, null);

    // AssetGrid
      var AssetGrid=function(t,e,i){var r=[],n=this,a=$(t),h=$(e);i=parseInt(i)||250;var s=function(t,e){e-=5*t.length;for(var i=0,r=0;r<t.length;++r)i+=$(t[r]).data("width")/$(t[r]).data("height");return e/i},d=function(t,e){r.push(e);for(var i=0;i<t.length;++i)$(t[i]).css({width:e*$(t[i]).data("width")/$(t[i]).data("height"),height:e})};n.resize=function(){var t=i,e=a.width()-30,r=0,n=h;t:for(;n.length>0;){for(var o=1;o<n.length+1;++o){var f=n.slice(0,o),v=s(f,e);if(t>v){d(f,v),r++,n=n.slice(o);continue t}}d(f,Math.min(t,v)),r++;break}},window.addEventListener("resize",n.resize),n.resize()};
  };



  if (!Array.prototype.indexOf)
  {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
      var len = this.length >>> 0;

      var from = Number(arguments[1]) || 0;
      from = (from < 0)
           ? Math.ceil(from)
           : Math.floor(from);
      if (from < 0)
        from += len;

      for (; from < len; from++)
      {
        if (from in this &&
            this[from] === elt)
          return from;
      }
      return -1;
    };
  }


  //
  // TIP THE FIRST DOMINO
  //

  function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
      window.onload = func;
    } else {
      window.onload = function() {
        if (oldonload) {
          oldonload();
        }
        func();
      }
    }
  };

  addLoadEvent(function(){
    CameraTag.setup();
  });
}