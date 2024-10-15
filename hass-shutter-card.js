class ShutterCard extends HTMLElement {
  
  
  set hass(hass) {
    const _this = this;
    const entities = this.config.entities;

    //console.log(`map: ${user_image_map}`)  // works
    
    //Init the card
    if (!this.card) {
      this.cardReady=false;
      const card = document.createElement('ha-card');
      
      if (this.config.title) {
          card.header = this.config.title;
      }
    
      this.card = card;
      this.appendChild(card);
    
      let windowImages = {}; 
      let allImages=[];

      entities.forEach(function(entity) {
        let entityId = entity;
        let sc_window_image = `${_this.image_map}/sc-window.png`;
        if (entity)
          {
            if (entity.entity) {
              entityId = entity.entity;
            }
            if (entity.window_image) {
              sc_window_image = _this.image_map+'/'+entity.window_image;
            }
            allImages.push({entityId,sc_window_image});
          }
      });

      const promises = allImages.map((image) =>
        _this.getImageDimensions(image.sc_window_image).then(dimensions => {
            windowImages[image.entityId] = {
                ...dimensions,
                url: image.sc_window_image,
            };
        })
      );
      Promise.all(promises)
          .then(() => {
              // build the shutter card
              this.buildShutters(entities,_this,hass,windowImages);
              this.cardReady=true;
          })
          .catch(error => console.error(error));
    }
    
    //Update the shutters UI
    if (this.cardReady) this.updateShutters(entities,_this,hass);
  }
// end main

  buildShutters(entities,_this,hass,windowImages)
  {
    let allShutters = document.createElement('div');
    allShutters.className = 'sc-shutters';

    entities.forEach(function(entity) {
        

      let entityId = entity.entity ? entity.entity : entity;

      let width = windowImages[entityId]?.width;
      let height = windowImages[entityId]?.height;
      let sc_window_image = windowImages[entityId]?.url; 
      
      let buttonsPosition = 'left';
      let titlePosition = 'top';
      let invertPercentage = false;
      let partial = 0;
      let offset = 0;
      let tilt = false;
      let closing_height=  0;
      let sc_view_image = `${_this.image_map}/sc-view.png`;
      let sc_slide_image = `${_this.image_map}/sc-slide.png`;
      let sc_slide_bottom_image = `${_this.image_map}/sc-slide-bottom.png`;
      let min_closing_position = 0;
      let max_closing_position = windowImages[entityId]?.height; 

      if (entity)
      {
        if (entity.buttons_position) {
          buttonsPosition = entity.buttons_position.toLowerCase();
          if (!['left', 'top', 'bottom', 'right'].includes(buttonsPosition)) {
            buttonsPosition = 'left'
          }
        }
        if (entity.title_position) {
            titlePosition = entity.title_position.toLowerCase();
        }
        if (entity.invert_percentage) {
          invertPercentage = entity.invert_percentage;
        }
        if (entity.window_image) {
          sc_window_image = _this.image_map+'/'+entity.window_image;
        }
        if (entity.view_image) {
          sc_view_image = _this.image_map+'/'+entity.view_image;
        }
        if (entity.slide_image) {
          sc_slide_image = `${_this.image_map}/${entity.slide_image}`;
        }
        if (entity.slide_bottom_image) {
          sc_slide_bottom_image = _this.image_map+'/'+entity.slide_bottom_image;
        }
        if (entity.partial_close_percentage) {
          partial = Math.max(0,Math.min(100,entity.partial_close_percentage)); // make sure this is valid range
        }
        if (entity.offset_closed_percentage) {
          offset = Math.max(0,Math.min(100,entity.offset_closed_percentage)); // make sure this is valid range
        }
        if (entity.min_closing_position) {
          min_closing_position = closing_height = Math.round(Math.max(0,Math.min(100,entity.min_closing_position))/100*height); // make sure this is valid range
        }
        if (entity.max_closing_position) {
          max_closing_position = Math.round(Math.max(0,Math.min(100,entity.max_closing_position))/100*height); // make sure this is valid range
        }
        if (entity.can_tilt) {
          tilt = entity.can_tilt;
        }
        if (entity.shutter_width) {
          width = Math.round(Math.max(7,Math.min(100,entity.shutter_width))/100*width); // make sure this is valid range
        }
        if (entity.shutter_height) {
          height = Math.round(Math.max(7,Math.min(100,entity.shutter_height))/100*height); // make sure this is valid range
        }
      }else{
        console.log('Never coming here... I think...');
      }

      const buttonsInRow = buttonsPosition == 'top' || buttonsPosition == 'bottom';
      const buttonsContainerReversed = buttonsPosition == 'bottom' || buttonsPosition == 'right';

      let shutter = document.createElement('div');

      shutter.className = 'sc-shutter';
      shutter.dataset.shutter = entityId;
      shutter.dataset.min_closing_position = min_closing_position;
      shutter.dataset.max_closing_position = max_closing_position;

      shutter.innerHTML = `
        <div class="sc-shutter-top" ` + (titlePosition == 'bottom' ? 'style="display:none;"' : '') + `>
          <div class="sc-shutter-label">

          </div>
          <div class="sc-shutter-position">

          </div>
        </div>
        <div class="sc-shutter-middle" style="flex-flow: ` + (buttonsInRow ? 'column': 'row') + (buttonsContainerReversed ? '-reverse' : '') + ` nowrap;">
          <div class="sc-shutter-buttons" style="flex-flow: ` + (buttonsInRow ? 'row': 'column') + ` wrap;">
            `+(partial?`<ha-icon-button label="Partially close (${partial}%)" class="sc-shutter-button sc-shutter-button-partial" data-command="partial" data-position="`+partial+`"><ha-icon icon="mdi:arrow-expand-vertical"></ha-icon></ha-icon-button>`:``)+`
            ` + (tilt?`
            <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.open_tilt_cover`) +`" class="sc-shutter-button sc-shutter-button-tilt-open" data-command="tilt-open"><ha-icon icon="mdi:arrow-top-right"></ha-icon></ha-icon-button>
            <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.close_tilt_cover`) +`"class="sc-shutter-button sc-shutter-button-tilt-down" data-command="tilt-close"><ha-icon icon="mdi:arrow-bottom-left"></ha-icon></ha-icon-button>
            `:``) + `
          </div>
          <div class="sc-shutter-buttons" style="flex-flow: ` + (buttonsInRow ? 'row': 'column') + ` wrap;">
            <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.open_cover`) +`" class="sc-shutter-button sc-shutter-button-up" data-command="up"><ha-icon icon="mdi:arrow-up"></ha-icon></ha-icon-button>
            <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.stop_cover`) +`"class="sc-shutter-button sc-shutter-button-stop" data-command="stop"><ha-icon icon="mdi:stop"></ha-icon></ha-icon-button>
            <ha-icon-button label="` + hass.localize(`ui.dialogs.more_info_control.cover.close_cover`) +`" class="sc-shutter-button sc-shutter-button-down" data-command="down"><ha-icon icon="mdi:arrow-down"></ha-icon></ha-icon-button>
          </div>
          <div class="sc-shutter-selector" style="width: ${width}px; height: ${height}px">
            <div class="sc-shutter-selector-picture" style="background-overflow: hidden; width: ${width}px; background-image: url(${sc_view_image})";>
              <img src= "${sc_window_image}" style="width: ${width}px; height: ${height}px">
              <div class="sc-shutter-selector-slide" style="top: 0; width: ${width}px; height: ${closing_height}px; background-image: url(${sc_slide_image});">
                <img src="${sc_slide_bottom_image}"; style="width: ${width}px; position: absolute; bottom: 0";>
              </div>
              <div class="sc-shutter-selector-picker" style="top: ${_this.minPosition-_this.picker_overlap}px;"></div>`+
              (partial&&!offset?
                `<div class="sc-shutter-selector-partial" style="top:`+_this.calculatePositionFromPercent(partial, invertPercentage, offset, shutter.dataset)+`px"></div>`:``
              ) + `
              <div class="sc-shutter-movement-overlay">
                <ha-icon class="sc-shutter-movement-open" icon="mdi:arrow-up"></ha-icon>
                <ha-icon class="sc-shutter-movement-close" icon="mdi:arrow-down"></ha-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="sc-shutter-bottom" ` + (titlePosition != 'bottom' ? 'style="display:none;"' : '') + `>
          <div class="sc-shutter-label">

          </div>
          <div class="sc-shutter-position">

          </div>
        </div>
      `;

      let picture = shutter.querySelector('.sc-shutter-selector-picture');
      let pictureBox = picture.getBoundingClientRect();



      let slide = shutter.querySelector('.sc-shutter-selector-slide');
      let picker = shutter.querySelector('.sc-shutter-selector-picker');
      let labels = shutter.querySelectorAll('.sc-shutter-label');

      let detailOpen = function(event) {
          let e = new Event('hass-more-info', { composed: true });
          e.detail = {
            entityId
          };
          _this.dispatchEvent(e);
      }

      labels.forEach((labelDOM) => {
          labelDOM.addEventListener('click', detailOpen);
          //console.log('labels foreach');
        }
      )

      let mouseDown = function(event) {
          if (event.cancelable) {
            //Disable default drag event
            event.preventDefault();
          }

          _this.isUpdating = true;

          document.addEventListener('mousemove', mouseMove);
          document.addEventListener('touchmove', mouseMove);
          document.addEventListener('pointermove', mouseMove);

          document.addEventListener('mouseup', mouseUp);
          document.addEventListener('touchend', mouseUp);
          document.addEventListener('pointerup', mouseUp);
      };

      let mouseMove = function(event) {
        let newPosition = event.pageY - _this.getPictureTop(picture);
        _this.setPickerPosition(newPosition, picker, slide, shutter.dataset);
      };

      let mouseUp = function(event) {

        
        let minPosition = shutter.dataset.min_closing_position;
        let maxPosition = shutter.dataset.max_closing_position;

        console.log('mouseUp >> minPosition='+ minPosition);
        console.log('mouseUp >> maxPosition='+ maxPosition);

        _this.isUpdating = false;

        let newPosition = event.pageY - _this.getPictureTop(picture);

        newPosition = Math.min(maxPosition,Math.max(minPosition,newPosition));

        let percentagePosition = (newPosition - minPosition) * (100-offset) / (maxPosition - minPosition);

        if (invertPercentage) {
          _this.updateShutterPosition(hass, entityId, percentagePosition);
        } else {
          _this.updateShutterPosition(hass, entityId, 100 - percentagePosition);
        }

        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('touchmove', mouseMove);
        document.removeEventListener('pointermove', mouseMove);

        document.removeEventListener('mouseup', mouseUp);
        document.removeEventListener('touchend', mouseUp);
        document.removeEventListener('pointerup', mouseUp);
      };

      //Manage slider update
      picker.addEventListener('mousedown', mouseDown);
      picker.addEventListener('touchstart', mouseDown);
      picker.addEventListener('pointerdown', mouseDown);

      //Manage click on buttons
      shutter.querySelectorAll('.sc-shutter-button').forEach(function (button) {
          button.onclick = function () {
              const command = this.dataset.command;

              let service = '';
              let args = ''

              switch (command) {
                case 'up':
                    service = 'open_cover';
                    break;

                case 'down':
                    service = 'close_cover';
                    break;

                case 'stop':
                    service = 'stop_cover';
                    break;
                case 'partial':
                    service = 'set_cover_position';
                    args = {
                      position: this.dataset.position
                    }
                    break;
                case 'tilt-open':
                  service = 'open_cover_tilt';
                  break;
                case 'tilt-close':
                  service = 'close_cover_tilt';
                  break;
                default:
                  return
              }

              hass.callService('cover', service, {
                entity_id: entityId,
                ...args
              });
          };
      });
      const style = document.createElement('style');
      style.textContent = `
        .sc-shutters { padding: 16px; }
          .sc-shutter { margin-top: 1rem; overflow: hidden; }
          .sc-shutter:first-child { margin-top: 0; }
          .sc-shutter-middle { display: flex; width: fit-content; max-width: 100%; margin: auto; }
            .sc-shutter-buttons { flex: 1; text-align: center; margin-top: 0.4rem; display: flex; max-width: 100% }
            .sc-shutter-buttons ha-icon-button { display: block; width: min-content }
            .sc-shutter-selector { flex: 1; }
              .sc-shutter-selector-partial { position: absolute; top:0; left: 0px; width: 100%; height: 1px; background-color: gray; }
              .sc-shutter-selector-picture {
                z-index: 1;
                position: relative;
                margin: auto;
                background-size: cover;
                min-height: 10px;
                min-width: 10px;
                max-height: 2000px;
                line-height: 0;
              }
              .sc-shutter-selector-window
              {
                z-index: 2;
                position: absolute;
                background-size: 100% 100%;
                width: 100%; 
                height: 100%; 
              }
              .sc-shutter-selector-slide 
              { 
                z-index: -1;  
                position: absolute; 
                background-position: bottom;
              }
              .sc-shutter-selector-picker 
              { 
                z-index: 3;  
                position: absolute; 
                top: 7px; 
                left: 0%; 
                width: 100%; 
                cursor: pointer; 
                height: 30px; 
                background-repeat: no-repeat; 
              }
              .sc-shutter-movement-overlay { 
                display: none;
                position: absolute; top: 19px; left: 0%; width: 100%; height: 118px;
                background-color: rgba(0,0,0,0.3); text-align: center; --mdc-icon-size: 60px
              }
                .sc-shutter-movement-open {display: none}
                .sc-shutter-movement-close {display: none}
          .sc-shutter-top { text-align: center; margin-bottom: 1rem; }
          .sc-shutter-bottom { text-align: center; margin-top: 1rem; }
            .sc-shutter-label { display: inline-block; font-size: 20px; vertical-align: middle; cursor: pointer;}
            .sc-shutter-position { display: inline-block; vertical-align: middle; padding: 0 6px; margin-left: 1rem; border-radius: 2px; background-color: var(--secondary-background-color); }
      `;
    
      _this.card.appendChild(allShutters);
      _this.appendChild(style);

      allShutters.appendChild(shutter);
    });

  }
  updateShutters(entities,_this,hass){
    entities.forEach(function(entity) {
      let entityId = entity;
      if (entity && entity.entity) {
        entityId = entity.entity;
      }
//      console.log('In updateShutters: '+ entityId);

      let invertPercentage = false;
      if (entity && entity.invert_percentage) {
        invertPercentage = entity.invert_percentage;
      }
        
      let offset = false;
      if (entity && entity.offset_closed_percentage) {
        offset = entity.offset_closed_percentage;
      }
        
      let alwaysPercentage = false;
      if (entity && entity.always_percentage) {
        alwaysPercentage = entity.always_percentage;
      }

      let disableEnd = false;
      if (entity && entity.disable_end_buttons) {
        disableEnd = entity.disable_end_buttons;
      }

      const shutter = _this.card.querySelector('div[data-shutter="' + entityId +'"]');
      const slide = shutter.querySelector('.sc-shutter-selector-slide');
      const picker = shutter.querySelector('.sc-shutter-selector-picker');
      const dataset = shutter.dataset;
        
      const state = hass.states[entityId];
      const friendlyName = (entity && entity.name) ? entity.name : state ? state.attributes.friendly_name : 'unknown';
      const currentPosition = state ? state.attributes.current_position : 'unknown';
      const movementState = state? state.state : 'unknown';
      
      //console.log('Start labels querySelectorAll: ');

      shutter.querySelectorAll('.sc-shutter-label').forEach(function(shutterLabel) {
          shutterLabel.innerHTML = friendlyName;
          //console.log('labels querySelectorAll: '+friendlyName );

      })
      
      if (!_this.isUpdating) {
        shutter.querySelectorAll('.sc-shutter-position').forEach(function (shutterPosition) {
          let visiblePosition;
          let positionText;
          if (invertPercentage) {
            visiblePosition = offset?Math.min(100, Math.round(currentPosition / offset * 100 )):currentPosition;
            positionText = _this.positionPercentToText(visiblePosition, invertPercentage, alwaysPercentage, hass);
            if (disableEnd) {
              _this.changeButtonState(shutter, currentPosition, invertPercentage);
            }
            if (visiblePosition == 100 && offset) {
              positionText += ' ('+ (100-Math.round(Math.abs(currentPosition-visiblePosition)/offset*100)) +' %)';
            }
          }
          else  {
            visiblePosition = offset?Math.max(0, Math.round((currentPosition - offset) / (100-offset) * 100 )):currentPosition;
            positionText = _this.positionPercentToText(visiblePosition, invertPercentage, alwaysPercentage, hass);
            if (disableEnd) {
              _this.changeButtonState(shutter, currentPosition, invertPercentage);
            }
            if (visiblePosition == 0 && offset) {
              positionText += ' ('+ (100-Math.round(Math.abs(currentPosition-visiblePosition)/offset*100)) +' %)';
            }
          }
          
          shutterPosition.innerHTML = positionText;
          
        })

        _this.setPickerPositionPercentage(currentPosition, picker, slide, invertPercentage, offset, dataset);
        

        _this.setMovement(movementState, shutter);
      }
    });

  }
  changeButtonState(shutter, percent, inverted) {
    if (percent == 0) {
      shutter.querySelectorAll('.sc-shutter-button-up').forEach(function(button) {
        button.disabled = inverted;
      });
      shutter.querySelectorAll('.sc-shutter-button-down').forEach(function(button) {
        button.disabled = !inverted;
      });
    }
    else if (percent == 100) {
      shutter.querySelectorAll('.sc-shutter-button-up').forEach(function(button) {
        button.disabled = !inverted;
      });
      shutter.querySelectorAll('.sc-shutter-button-down').forEach(function(button) {
        button.disabled = inverted;
      }) ;     
    }
    else {      
      shutter.querySelectorAll('.sc-shutter-button-up').forEach(function(button) {
        button.disabled = false;
      });
      shutter.querySelectorAll('.sc-shutter-button-down').forEach(function(button) {
        button.disabled = false;
      }) ;
    }
  }

  positionPercentToText(percent, inverted, alwaysPercentage, hass) {
    if (!alwaysPercentage) {
      if (percent == 100) {
        return hass.localize(inverted?'ui.components.logbook.messages.was_closed':'ui.components.logbook.messages.was_opened');
      }
      else if (percent == 0) {
        return hass.localize(inverted?'ui.components.logbook.messages.was_opened':'ui.components.logbook.messages.was_closed');
      }
    }
    return percent + ' %';
  }

  calculatePositionFromPercent(percent, inverted, offset,dataset) {
    let visiblePosition;
    let maxPosition = dataset.max_closing_position;
    let minPosition = dataset.min_closing_position;

    if (inverted) {
      visiblePosition = offset?Math.min(100, Math.round(percent / offset * 100 )):percent;
    }
    else  {
      visiblePosition = offset?Math.max(0, Math.round((percent - offset) / (100-offset) * 100 )):percent;
    }
    //console.log('calculatePositionFromPercent >> this.min_closing_position='+ this.min_closing_position);

    return (maxPosition - minPosition) * (inverted?visiblePosition:100-visiblePosition) / 100 + minPosition;
  }

  
  getPictureTop(picture) {
      let pictureBox = picture.getBoundingClientRect();
      let body = document.body;
      let docEl = document.documentElement;

      //let str = JSON.stringify(pictureBox, null, 4); 
      //console.log('pictureBox: '+str);

      let scrollTop = window.scrollY || docEl.scrollTop || body.scrollTop;

      let clientTop = docEl.clientTop || body.clientTop || 0;

      let pictureTop  = pictureBox.top + scrollTop - clientTop;
      
      return pictureTop;
  }

  setMovement(movement, shutter) {
    //console.log('movement: '+movement);
    //console.log('text: '+shutter.innerHTML);
    if (movement == "opening" || movement == "closing") {
      let opening = movement == "opening"
      shutter.querySelectorAll(".sc-shutter-movement-overlay").forEach(
        (overlay) => overlay.style.display = "block"
      )
      shutter.querySelectorAll(".sc-shutter-movement-open").forEach(
        (overlay) => overlay.style.display = opening?"block":"none"
      )
      shutter.querySelectorAll(".sc-shutter-movement-close").forEach(
        (overlay) => overlay.style.display = opening?"none":"block"
      )
    }
    else {
      shutter.querySelectorAll(".sc-shutter-movement-overlay").forEach(
        (overlay) => overlay.style.display = "none"
      )
    }
  }
  
  setPickerPositionPercentage(percentage, picker, slide, inverted, offset, dataset) {
    let realPosition = this.calculatePositionFromPercent(percentage, inverted, offset,dataset);
  
    this.setPickerPosition(realPosition, picker, slide, dataset);
  }
  
  setPickerPosition(position, picker, slide, dataset) {

    //console.log('setPickerPosition >> this.min_closing_position='+ this.min_closing_position);
    let minPosition = dataset.min_closing_position;
    let maxPosition = dataset.max_closing_position;
    position= Math.round(Math.max(minPosition,Math.min(position,maxPosition)));
  
    picker.style.top = (position - this.picker_overlap) + 'px';
    slide.style.height = (position ) + 'px';
  }
  
  updateShutterPosition(hass, entityId, position) {
    let shutterPosition = Math.round(position);

    console.log('position: '+ position);
    console.log('shutterPosition: '+shutterPosition);
  
    hass.callService('cover', 'set_cover_position', {
      entity_id: entityId,
      position: shutterPosition
    });
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define entities');
    }
    
    this.config = config;
    this.maxPosition = 200;
    this.minPosition = 22;
    this.picker_overlap = 7;
    this.image_map="/local/community/hass-shutter-card/images";
    this.cardReady= false;

    this.isUpdating = false;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return this.config.entities.length + 1;
  }

  getImageDimensions(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = function() {
          // Wanneer de afbeelding is geladen, retourneer de breedte en hoogte
          resolve({ width: img.width, height: img.height });
      };

      img.onerror = function() {
          // Als er een fout optreedt bij het laden van de afbeelding
          reject(new Error(`Image '${img.src}' not found.`));
      };

      // Stel de bron van de afbeelding in
      img.src = imageUrl;
    });
  }
}
// Voorbeeld van het gebruik van de functie
//getImageDimensions('https://example.com/image.jpg')
//  .then(dimensions => console.log(`Breedte: ${dimensions.width}, Hoogte: ${dimensions.height}`))
//  .catch(error => console.error(error));}

customElements.define("shutter-card", ShutterCard);