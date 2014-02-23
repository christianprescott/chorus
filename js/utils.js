/**
 *
 *  This is bunch of generic helper utils to keep basic logic out of the main app
 *  @TODO cleanup and move stuff to better locations
 *
 */


/**
 * what our setTimeout is attached to
 */
var notificationTimoutObj = {};


/**
 * Generic Helper Utils Binds
 */
$(window).on('shellReady', function(){
  // Get our dialog ready for use
  app.helpers.dialogInit();
  // get version
  $.get('addon.xml',function(data){
    app.addonData = $(data).find('addon').attr();
  });
});


/**
 * Dom ready
 */
$(document).ready(function(){


  /********************************************************************************
   * vars/definitions
   ********************************************************************************/

  /**
   * Generic vars
   */
  app.helpers = {};
  app.helpers.scroller = {};

  /**
   * A wrapper for getting the main selectors
   * @param name
   * @returns {*}
   */
  app.helpers.getSelector = function(name){

    var selectors = {
      content: '#content',
      title: '#title',
      dialog: '#dialog',
      sidebar1: '#sidebar-first',
      sidebar2: '#sidebar-second'
    };

    return selectors[name];
  };


  /********************************************************************************
   * Error logging helpers
   ********************************************************************************/

  /**
  * Error handler
  * @param type
  *  type of error, any kind of string
  * @param error
   * error object
  */
  app.helpers.errorHandler = function(type, error){
    if(typeof error[0] != 'undefined' && error[0].error == "Internal server error"){
      // no connection
    } else {
      // standard item
      console.log('%c Bam! Error occurred (' + type + ')', app.helpers.consoleStyle(4), error);
    }
  };


  /**
   * Debug styles
   * @param args
   */
  app.helpers.consoleStyle = function(style){

    var defaults = {
      background: '#ccc',
      padding: '0 5px',
      color: '#444',
      'font-weight': 'bold',
      'font-size': '110%'
    }, styles = [];

    var mods = [
      {background: '#D8FEFE'},
      {background: '#CCFECD'},
      {background: '#FFFDD9'},
      {background: '#FAE9F1'},
      {background: '#FFCECD'}
    ];

    if(typeof style != undefined){
      defaults = $.extend(defaults, mods[style]);
    }

    for(prop in defaults){
      styles.push(prop + ': ' + defaults[prop]);
    }

    return styles.join('; ');
  };


  /********************************************************************************
   * Global helpers
   ********************************************************************************/


  /**
   * Variables all variables are for use in a single page load, not for persistent storage.
   *
   * Set a variable
   * @param name
   * @param val
   */
  app.helpers.varSet = function(name, val){
    app.vars[name] = val;
  };


  /**
   * Get a variable
   * @param name
   * @param fallback
   * @returns {*}
   */
  app.helpers.varGet = function(name, fallback){
    return (typeof app.vars[name] != undefined ? app.vars[name] : fallback);
  };


  /**
   * like arg() in drupal
   */
  app.helpers.arg = function(n){

    var hash = location.hash,
      args = hash.substring(1).split('/');

    // if n set return string
    if(typeof n != 'undefined'){
      if(typeof args[n] == 'undefined'){
        return '';
      }
      return args[n];
    }

    // return array
    return args;
  };


  /**
   * like shuffle() in php
   */
  app.helpers.shuffle = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };


  /**
   *  Alphabetical sort callback
   */
  app.helpers.aphabeticalSort = function(a,b){
    var nameA=a.toLowerCase(), nameB=b.toLowerCase();
    if (nameA < nameB){ //sort string ascending
      return -1;
    }
    if (nameA > nameB){
      return 1;
    }
    return 0; //default return value (no sorting)
  };


  /**
   *  is a value an int
   */
  app.helpers.isInt = function(value){
    if(app.helpers.exists(value)){
      return ((parseFloat(value) == parseInt(value)) && !isNaN(value));
    }
    return false;
  };


  /**
   * get a random int
   * @param min
   * @param max
   * @returns {number|string}
   */
  app.helpers.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };


  /**
   * Convert seconds to time
   */
  app.helpers.secToTime = function(totalSec){
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    // return a string with zeros only when we need em
    return (hours > 0 ? hours + ":" : "") + //hours
      (minutes > 0 ? (hours > 0 && minutes < 10 ? "0" + minutes : minutes) + ":" : (hours > 0 ? "00:" : "")) + //mins
      (seconds  < 10 ? "0" + seconds : seconds); //seconds
  };


  /**
   * wrapper for if ! undefined (seem to use it a bit)
   */
  app.helpers.exists = function(data){
    return (typeof data != 'undefined');
  };

  /**
   * Parse a rating into x.x/10 stars
   * @return float
   */
  app.helpers.rating = function(rating){
    return Math.round(rating * 10) / 10;
  };


  /********************************************************************************
   * URL Functions
   ********************************************************************************/


  /**
   * Add a url to a collection of models
   * @return float
   */
  app.helpers.buildUrls = function(models, page, idKey){
    $.each(models, function(i,d){
      models[i].url = app.helpers.buildUrl(page, d[idKey]);
    });
    return models;
  };


  /**
   * Add a url to a collection of models
   * @return float
   */
  app.helpers.buildUrl = function(type, id){
    // songs and files go home
    if(type == 'song' || type == 'file'){
      return '#';
    }
    // else build
    return '#' + type + '/' + id;
  };



  /********************************************************************************
   * First Sidebar
   ********************************************************************************/


  /**
   * Populate the first sidebar
   * @param content
   * @param append
   */
  app.helpers.setFirstSidebarContent = function(content, append){
    append = (typeof append != 'undefined' && append === true);

    var $container = app.helpers.getFirstSidebarContent();

    // add the content
    if(append){
      $container.append(content);
    } else {
      $container.html(content);
    }

    // trigger binds
    app.helpers.firstSidebarBinds();
  };


  /**
   * Get the first sidebar
   */
  app.helpers.getFirstSidebarContent = function(){

    // ensure sidebar is visible
    app.helpers.toggleSidebar('open');

    var $sidebarFirst = $(app.helpers.getSelector('sidebar1'));
    return $(".sidebar-content", $sidebarFirst);

  };


  /**
   * first sidebar binds
   */
  app.helpers.firstSidebarBinds = function(){

    var $container = app.helpers.getFirstSidebarContent();

    // ensure sidebar is visible
    app.helpers.toggleSidebar('open');

    // trigger lazyload
    $("img.lazy").lazyload({
      effect : "fadeIn",
      container: $container
    });

    // let others hook in
    $container.trigger('scroll');

  };


  /**
   * Toggle sidebar
   * @param state
   *  optional: if not set will toggle, else 'open' or 'close'
   */
  app.helpers.toggleSidebar = function(state){
    var addc = 'sidebar', rmc = 'no-sidebar', $body = $('body');
    if(typeof state == undefined){
      $body.toggleClass(addc).toggleClass(rmc);
    } else {
      if(state == 'open'){
        $body.addClass(addc).removeClass(rmc);
      }
      if(state == 'close'){
        $body.addClass(rmc).removeClass(addc);
      }
    }
  };


  /********************************************************************************
   * Image helpers
   ********************************************************************************/


  /**
   * Get default image
   */
  app.helpers.getDefaultImage = function(type){

    // @TODO move elsewhere
    var files = [
        'wallpaper-443657.jpg',
        'wallpaper-45040.jpg',
        'wallpaper-765190.jpg',
        'wallpaper-84050.jpg'
      ],
      random = files[app.helpers.getRandomInt(0, (files.length - 1))];

    // return random
    return 'theme/images/fanart_default/' + random;

  };


  /**
   * Is default image
   */
  app.helpers.isDefaultImage = function(img){
    return (app.helpers.varGet('defaultImage') == img);
  };


  /**
   * Freewall Layout
   * @param selector
   */
  app.helpers.addFreewall = function(selector){
    var wall = new freewall(selector);
    wall.reset({
      selector: 'li',
      animate: true,
      cellW: 170,
      cellH: '230',
      onResize: function() {
        wall.fitWidth();
      }
    });
    wall.fitWidth();
  };


  /**
   * Freewall Poster Layout
   * @param selector
   */
  app.helpers.addPosterFreewall = function(selector){
    var wall = new freewall(selector);
    wall.reset({
      selector: 'li',
      animate: true,
      cellW: 170,
      cellH: '305',
      onResize: function() {
        wall.fitWidth();
      }
    });
    wall.fitWidth();
  };


  /**
   * Trigger lazyload
   */
  app.helpers.triggerContentLazy = function(){
    // trigger lazyload
    $("img.lazy").lazyload({
      //  effect : "fadeIn",
      threshold : 200
    });
    // show visible
    $(window).trigger('scroll');

  };


  /********************************************************************************
   * Song/Artist helpers
   ********************************************************************************/


  /**
   * For a given song returns the type and id to use when dealing with the player
   * @param song
   *  assumes songid is file
   * @return {type, id}
   */
  app.helpers.getSongKey = function(song){
    var o = {
      type: (song.songid == 'file' || typeof song.songid == 'undefined' ? 'file' : 'songid')
    };
    o.id = (o.type == 'file' ? song.file : song.songid);
    return o;
  };


  /**
   * A song has artists and artist ids as an array, this parses them into links
   * @param item
   * assumes artist and artistid are properties and arrays
   */
  app.helpers.parseArtistsArray = function(item){
    var meta = [], str;
    for(i in item.artist){ //each artist in item

      if(item.artistid != undefined){ //artist id found
        str = '<a href="#artist/' + item.artistid[i] + '">' + item.artist[i] + '</a>';
      } else { //if no artist ids found
        str = item.artist[i];
      }
      meta.push(str);
    }
    return meta.join(', '); //out as a string
  };


  app.helpers.parseArtistSummary = function(data){
    var totals = {songs:0,albums:0,time:0};
    for(i in data.models){
      totals.albums++;
      for(s in data.models[i].attributes.songs){
        totals.songs++;
        totals.time = totals.time + parseInt(data.models[i].attributes.songs[s].attributes.duration);
      }
    }

    var meta = [];
    meta.push( totals.songs + ' Songs' );
    meta.push( totals.albums + ' Albums' );
    meta.push( Math.floor( (totals.time / 60) ) + ' Mins' );

    return meta.join('<br />');
  };


  /********************************************************************************
   * Pagination
   ********************************************************************************/

  /**
   * Give it a pagenumber and it will build return a range object suitable for a API request
   *
   * @param pageNum
   * @returns {{start: number, end: number}}
   */
  app.helpers.createPaginationRange = function(pageNum, fullRange){
    // Do some maths
    var page = (pageNum != undefined ? parseInt(pageNum) : 0),
      start = (page * app.itemsPerPage),
      end = (start + app.itemsPerPage);
    // override if fullRange
    if(fullRange && fullRange === true){
      start = 0;
    }
    // Return the range
    return {'end': end, 'start': start};
  };


  /********************************************************************************
   * Backstretch
   ********************************************************************************/


  /**
   * Add / update backstretch if required
   *
   * @param fanart
   *  The image to use
   * @param player
   * local or xbmc
   */
  app.helpers.applyBackstretch = function(fanart, player){
    // Ensure on homepage and using the correct player
    if(location.hash == '#' || location.hash == '' && app.audioStreaming.getPlayer() == player){
      // if homepage backstretch exists and changed, update
      var $bs = $('.backstretch img'),
        origImg = $bs.attr('src'),
        newImg = app.parseImage(fanart, 'fanart');
      // if image is different
      if($bs.length > 0 && origImg != newImg){
        $.backstretch(newImg);
      }
    }
  };



 /********************************************************************************
   * Title
   ********************************************************************************/


  /**
   * Wrapper for setting page title
   * @param value
   * @param options
   *   tabs = {url:title, url:title}
   *   addATag = wraps the value in an a tag
   * @returns {boolean}
   */
  app.helpers.setTitle = function(value, options){
    var defaults = {
      addATag: false,
      tabs: false,
      activeTab: 0
    };

    var settings = $.extend(defaults,options),
      $title = $('#title');

    $title.empty();

    // add <a> tag if set
    if(settings.addATag){
      $title.append($('<a class="title-sub" href="' + settings.addATag + '">' + value + '</a>'));
    }

    // append tabs
    var n = 0;
    if(settings.tabs !== false){
      var $tabs = $('<div class="nav nav-tabs"></div>');
      for(i in settings.tabs){
        var $el = $('<a href="' + i + '" class="nav-tab">' + settings.tabs[i] + '</a>');
        $tabs.append( $el );
        n++;
      }
      $title.append($tabs);
    }

    // if value not added, as that in a wrapper
    if(!settings.addATag){
      $title.append('<div class="title-main">' + value + '</div>');
    }

    //cache
    app.currentPageTitle = value;
  };


  /**
   * Wrapper for getting page title
   */
  app.helpers.getTitle = function(){
    return app.currentPageTitle;
  };


  /********************************************************************************
   * Dialogs
   ********************************************************************************/


  /**
   * Wrapper for dialog box init
   * @param options
   *  http://jqueryui.com/demos/dialog/
   */
  app.helpers.dialogInit = function( options ){

    var settings = {
      autoOpen: false,
      height: "auto",
      width: 350,
      modal: true ,
      resizable: false
    };

    settings = jQuery.extend(settings, options);

    $( app.helpers.getSelector('dialog') ).dialog( settings );

  };


  /**
   * Open a Dialog window
   */
  app.helpers.dialog = function(content, options){

    var $dialog = $( app.helpers.getSelector('dialog') );

    // init dialog if required
    if(!$dialog.hasClass('ui-dialog-content')){
      app.helpers.dialogInit();
    }

    $dialog.dialog( "option", "title", " ");
    $dialog.dialog( "option", "height", "auto");
    $dialog.dialog( "option", "buttons", {});

    //set content and options
    $dialog.html(content);
    $dialog.dialog( "option", options );

    //fix scrollTo issue with dialog
    $dialog.bind( "dialogopen", function(event, ui) {
      $('.ui-widget-overlay, .ui-dialog').css('position', 'fixed');
      $('.dialog-menu a:last').addClass('last');

      // bind to enter
      $dialog.keypress(function(e) {
        if (e.keyCode == $.ui.keyCode.ENTER) {
          // look for a button with class "bind-enter" first, fallback to OK btn, fallback to none.
          var $parent = $(this).parent(),
            $enterButton = $parent.find('.bind-enter'),
            $btn = ($enterButton.length == 0 ? $parent.find('.ui-dialog-buttonpane button:first') : $enterButton);
          $btn.trigger("click");
        }
      });
    });

    //open
    $dialog.dialog( "open" );

  };


  /**
   * Close the dialog
   */
  app.helpers.dialogClose = function(){
    $( app.helpers.getSelector('dialog') ).dialog( "close" );
  };


  /**
   * Emulates confirm() but using our dialog
   * @param msg
   *  string message to display
   * @param success
   *  function callback
   */
  app.helpers.confirm = function(msg, success){

    var opts = {
      title: 'Are you sure?',
      buttons: {
        "OK": function(){
          success();
          $( this ).dialog( "close" );
        },
        "Cancel": function() {
          $( this ).dialog( "close" );
        }
      }
    };

    app.helpers.dialog(msg, opts);
  };


  /**
   * Emulates prompt() but using our dialog
   * @param msg
   *  string message to display
   * @param success
   *  function callback
   */
  app.helpers.prompt = function(msg, success){

    var opts = {
      title: 'Prompt',
      buttons: {
        "OK": function(){
          var text = $('#promptText').val();
          if(text != ''){
            success(text);
            $( this ).dialog( "close" );
          }
        },
        "Cancel": function() {
          $( this ).dialog( "close" );
        }
      }
    };

    msg += '<div class="form-item"><input type="text" class="form-text" id="promptText" /></div>';

    app.helpers.dialog(msg, opts);
  };


  /**
   * About Dialog
   */
  app.helpers.aboutDialog = function(){

    var opts = {
      title: 'About this thing',
      buttons: {
        "Cool!": function(){
          $( this ).dialog( "close" );
        },
        "ChangeLog": function(){
          document.location = '#xbmc/changelog';
          $( this ).dialog( "close" );
        }
      }
    };

    // load template and show dialog
    app.helpers.applyTemplate('About', app.addonData, function(msg){
      app.helpers.dialog(msg, opts);
    });

  };


  /**
   * Menu Dialog, creates a dialog that is populated with a menu structure
   */
  app.helpers.menuDialog = function(menu){

    // vars
    var $content = $('<ul class="dialog-menu dialog-menu-' + menu.key + '"></ul>'),
      $liTpl = $('<li class="item"></li>'),
      $li = {};

    // menu items
    $.each(menu.items, function(i,d){
      // build li
      $li = $liTpl.clone();
      $li.html(d.title).addClass(d.class);
      // bind
      $li.on('click', function(e){
        app.helpers.dialogClose();
        if(d.callback){
          d.callback();
        }
      });

      // append
      $content.append($li);
    });

    // init dialog
    app.helpers.dialog($content, {
      title: menu.title
    });


  };



  /********************************************************************************
   * Dropdowns
   ********************************************************************************/


  /**
   * Build a dropdown menu html with some given settings
   * @todo move to template file
   *
   * @param options
   * @returns {string}
   */
  app.helpers.makeDropdown = function(options){

    // get defaults
    var defaults = {
        key: 'untitled',
        items: [],
        pull: 'left',
        omitwrapper: false
      },
      tpl = '',
      settings = $.extend(defaults, options);

    // start build output
    if(!settings.omitwrapper){
      tpl += '<div class="' + settings.key + '-actions list-actions">';
    }
    tpl += '<button class="' + settings.key + '-menu btn dropdown-toggle" data-toggle="dropdown"><i class="fa fa-ellipsis-v"></i></button>';
    tpl += '<ul class="dropdown-menu pull-' + settings.pull + '">';
    for(i in settings.items){
      var item = settings.items[i];
      tpl += '<li><a href="' + item.url + '" class="' + item.class + '">' + item.title + '</a></li>';
    }
    tpl += '</ul>';
    if(!settings.omitwrapper){
      tpl += '</div>';
    }

    // return html
    return tpl;
  };


  /**
   * Dropdown menu structures
   * @param type
   *  song, playlistShell
   *  @param model
   *   data from a model eg song.attributes
   * @returns {{}}
   */
  app.helpers.menuTemplates = function(type, model){

    var opts = {};
    switch (type){
      case 'song':
        opts = {
          title: (typeof model.label != 'undefined' && model.label != '' ? model.label : (model.album != '' ? model.album : '')),
          key: 'song',
          omitwrapper: true,
          items: [
            {url: '#', class: 'song-download', title: 'Download song', callback: function(){
              app.AudioController.downloadFile(model.file, function(url){ window.location = url; })
            }},
            {url: '#', class: 'song-custom-playlist', title: 'Add to custom playlist', callback: function(){
              //@TODO do an id lookup if no songid
              if(model.songid){ app.playlists.playlistAddItems('lists', 'new', 'song', model.songid); }
            }},
            {url: '#', class: 'song-browser-play', title: 'Play in browser', callback: function(){
              if(model.songid){ app.playlists.playlistAddItems('local', 'replace', 'song', model.songid); }
            }}
          ]
        };
        break;

      // also contains callbacks
      case 'album':
        opts = {
          title: (model.album != '' ? model.album : model.label),
          key: 'album',
          omitwrapper: true,
          items: [
            {url: '#', class: 'album-add-xbmc', title: 'Add to XBMC', callback: function(){
              app.playlists.playlistAddItems('xbmc', 'append', 'album', model.albumid);
            }},
            {url: '#', class: 'album-add-local', title: 'Play in browser', callback: function(){
              app.playlists.playlistAddItems('local', 'replace', 'album', model.albumid);
            }},
            {url: '#', class: 'album-add-lists', title: 'Save to lists', callback: function(){
              app.playlists.playlistAddItems('lists', 'new', 'album', model.albumid)
            }}
          ]
        };
        break;

      // also contains callbacks
      case 'artist':
        opts = {
          title: model.label,
          key: 'artist',
          omitwrapper: true,
          items: [
            {url: '#', class: 'artist-add-xbmc', title: 'Add to XBMC', callback: function(){
              app.playlists.playlistAddItems('xbmc', 'append', 'artist', model.artistid);
            }},
            {url: '#', class: 'artist-add-local', title: 'Play in browser', callback: function(){
              app.playlists.playlistAddItems('local', 'replace', 'artist', model.artistid);
            }},
            {url: '#', class: 'artist-add-lists', title: 'Save to lists', callback: function(){
              app.playlists.playlistAddItems('lists', 'new', 'artist', model.artistid)
            }}
          ]
        };
        break;

      // also contains callbacks
      case 'movie':
        opts = {
          title: model.label,
          key: 'movie',
          omitwrapper: true,
          items: [
            {url: '#', class: 'movie-download', title: 'Download Movie', callback: function(){
              app.AudioController.downloadFile(model.file, function(url){ window.location = url; })
            }}
//            ,
//            {url: '#', class: 'movie-add-xbmc', title: 'Add to XBMC', callback: function(){
//              app.playlists.playlistAddItems('xbmc', 'append', 'album', model.albumid);
//            }},
//            {url: '#', class: 'movie-add-local', title: 'Play in browser', callback: function(){
//              app.playlists.playlistAddItems('local', 'replace', 'album', model.albumid);
//            }},
//            {url: '#', class: 'movie-add-lists', title: 'Save to lists', callback: function(){
//              app.playlists.playlistAddItems('lists', 'new', 'album', model.albumid)
//            }}
          ]
        };
        break;

      case 'playlistShell':
        opts = {
          key: 'playlist',
          pull: 'right',
          items: [
            {url: '#', class: 'save-playlist', title: 'Save XBMC Playlist'},
            {url: '#', class: 'clear-playlist', title: 'Clear Playlist'},
            {url: '#', class: 'refresh-playlist', title: 'Refresh Playlist'},
            {url: '#', class: 'new-custom-playlist', title: 'New Browser Playlist'}
          ]
        };
        break;

    }
    return opts;
  };


  /********************************************************************************
   * Templates
   ********************************************************************************/


  /**
   * load html templates (called @ dom ready)
   *
   * @param views
   * @param callback
   */
  app.helpers.loadTemplates = function(views, callback) {

    var deferreds = [];

    $.each(views, function(index, view) {
      if (app[view]) {
        deferreds.push($.get('tpl/' + view + '.html', function(data) {
          app[view].prototype.template = _.template(data);
        }, 'html'));
      } else {
        alert(view + " not found");
      }
    });

    $.when.apply(null, deferreds).done(callback);
  };


  /**
   * Load a single template on the fly
   *
   * @param tpl
   * @param callback
   *  callback returns the template object
   */
  app.helpers.loadTemplate = function(tpl, callback) {
    $.get('tpl/' + tpl + '.html', function(data) {
      app.tpl[tpl] = data;
      if(callback){
        callback(app.tpl[tpl]);
      }
    });
  };


  /**
   * Apply a template to data
   *
   * @param tpl
   * @param callback
   *  callback returns the template
   */
  app.helpers.applyTemplate = function(tplname, data, callback) {

    var html = '';
    if(typeof app.tpl[tplname] != 'undefined'){
      html = _.template(app.tpl[tplname],data);
      callback(html);
    } else {
      app.helpers.loadTemplate(tplname, function(tpl){
        html = _.template(tpl,data);
        callback(html);
      })
    }

  };


  /********************************************************************************
   * Infinate scroll
   ********************************************************************************/

  app.helpers.nearbottom = function(e) {
    var $window = $(window);

    var pixelsFromWindowBottomToBottom = 0 + $(document).height() - ($window.scrollTop()) - $window.height();
    var pixelsToBottom = 600;

    return (pixelsFromWindowBottomToBottom < pixelsToBottom);

  };





  /********************************************************************************
   * No namespace @todo move/rename
   ********************************************************************************/


  /**
   * returns a url to the image
   */
  app.parseImage = function(rawPath, type){
    type = (typeof type == 'undefined' ? 'default' : type);
    if(type == 'space'){
      return 'theme/images/space.png';
    }
    //no image, return placeholder
    if(typeof(rawPath) == "undefined" || rawPath == ''){
      if(type == 'fanart'){
        return app.helpers.getDefaultImage(type);
      }
      return app.helpers.varGet('defaultImage');
    }
    return '/image/' + encodeURIComponent(rawPath);
  };



  /**
   *  nl2br
   */
  app.nl2br = function(str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
  };


  /**
   * notification handler
   */
 app.notification = function(msg){
    var $notify = $('#notify');
    if(msg !== false && msg != ''){

      $notify.find('.content').html(msg);
      $notify.removeClass('hidden').parent().removeClass('hidden');
      clearTimeout(notificationTimoutObj);
      notificationTimoutObj = setTimeout(app.notificationHide, 6000); // 8 secs?*/
    }
  };
  app.notificationHide = function(){
    $notify = $('#notify').addClass('hidden').parent().addClass('hidden');
  };


  /********************************************************************************
   * DEPRECATED @todo safe remove
   ********************************************************************************/


  /**
   * Apply a js scroll bar with default settings
   */
  app.helpers.addScrollBar = function(selector, options){

    //$('.nicescroll-rails').remove();

    scrollbarSettings = {
      cursorwidth: 8,
      cursorminheight: 37,
      touchbehavior: false,
      cursorcolor: '#606768'
    };

    settings = $.extend(scrollbarSettings, options);

  };


  /********************************************************************************
   * Storage
   ********************************************************************************/


  /**
   * Deal with app local storage
   * @type {{nameSpace: string, set: Function, get: Function}}
   */
  app.storage = {


    //Vars
    nameSpace: 'chorus::',

    /**
     * Save data in local storage
     * @param key
     * @param data
     */
    set:function(key, data){
      $.totalStorage( this.nameSpace + key, data );
    },

    /**
     * Get a value from local storage
     * @param key
     * @param defaultData
     * @returns (*)
     */
    get:function(key, defaultData){
      var t = $.totalStorage( this.nameSpace + key );
      if(t != undefined && t != ''){
        return t;
      } else {
        return defaultData;
      }
    }

  };

});


/********************************************************************************
 * jQuery extends
 ********************************************************************************/


/**
 * enhance jquery.attr() to return obj on empty
 * @see http://stackoverflow.com/questions/14645806/get-all-attributes-of-an-element-using-jquery
 */
(function(old) {
  $.fn.attr = function() {
    if(arguments.length === 0) {
      if(this.length === 0) {
        return null;
      }

      var obj = {};
      $.each(this[0].attributes, function() {
        if(this.specified) {
          obj[this.name] = this.value;
        }
      });
      return obj;
    }

    return old.apply(this, arguments);
  };
})($.fn.attr);