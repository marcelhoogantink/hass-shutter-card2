class ShutterCard extends HTMLElement {
  
  
  set hass(hass) {
    const _this = this;
    const entities = this.config.entities;
    const image_map="/local/community/hass-shutter-card/images";
  
    
    //Init the card
    if (!this.card) {
      const card = document.createElement('ha-card');
      
      if (this.config.title) {
          card.header = this.config.title;
      }
    
      this.card = card;
      this.appendChild(card);
    
      let allShutters = document.createElement('div');
      allShutters.className = 'sc-shutters';
      entities.forEach(function(entity) {
        let entityId = entity;
        if (entity && entity.entity) {
            entityId = entity.entity;
        }
        
        let buttonsPosition = 'left';
        if (entity && entity.buttons_position) {
            buttonsPosition = entity.buttons_position.toLowerCase();
            if (!['left', 'top', 'bottom', 'right'].includes(buttonsPosition)) {
              buttonsPosition = 'left'
            }
        }
        const buttonsInRow = buttonsPosition == 'top' || buttonsPosition == 'bottom';
        const buttonsContainerReversed = buttonsPosition == 'bottom' || buttonsPosition == 'right';
        
        let titlePosition = 'top';
        let invertPercentage = false;
        let partial = 0;
        let offset = 0;
        let tilt = false;
        let height=  `${_this.minPosition}px`;
        let width = `153px`;
        //let width = `100%`;
        // https://aaronsmith.online/articles/use-javascript-to-get-original-dimensions-of-an-image-file/
        let sc_window_image = `${image_map}/sc-window.png`;
        let sc_view_image = `${image_map}/sc-view.png`;
        let sc_slide_image = `${image_map}/sc-slide.png`;
        let sc_slide_bottom_image = `${image_map}/sc-slide-bottom.png`;

        if (entity){
          if (entity.title_position) {
              titlePosition = entity.title_position.toLowerCase();
          }
          if (entity.invert_percentage) {
            invertPercentage = entity.invert_percentage;
          }
          if (entity.window_image) {
            sc_window_image = image_map+'/'+entity.window_image;
          }
          if (entity.view_image) {
            sc_view_image = image_map+'/'+entity.view_image;
          }
          if (entity.slide_image) {
            sc_slide_image = image_map+'/'+entity.slide_image;
          }
          if (entity.slide_bottom_image) {
            sc_slide_bottom_image = image_map+'/'+entity.slide_bottom_image;
          }
          if (entity.partial_close_percentage) {
            partial = Math.max(0,Math.min(100,entity.partial_close_percentage)); // make sure this is valid range
          }
          if (entity.offset_closed_percentage) {
            offset = Math.max(0,Math.min(100,entity.offset_closed_percentage)); // make sure this is valid range
          }
          if (entity.can_tilt) {
            tilt = entity.can_tilt;
          }
          if (entity.shutter_width_px) {
            width = Math.max(7,entity.shutter_width_px)+'px'; // make sure this is valid range
          }
        }
          
        let shutter = document.createElement('div');

        const img = new Image();
        img.src = sc_window_image;
        console.log('image size: '+img.width + 'x' + img.height)
        img.onload = function() {
          console.log('onload: image size: '+img.width + 'x' + img.height)
        }
        shutter.className = 'sc-shutter';
        shutter.dataset.shutter = entityId;
        shutter.innerHTML = `
          <div class="sc-shutter-top" ` + (titlePosition == 'bottom' ? 'style="display:none;"' : '') + `>
            <div class="sc-shutter-label">
            
            </div>
            <div class="sc-shutter-position">
            
            </div>
          </div>
          <div class="sc-shutter-middle" style="flex-flow: ` + (buttonsInRow ? 'column': 'row') + (buttonsContainerReversed ? '-reverse' : '') + ` nowrap;">
            <div class="sc-shutter-buttons" style="flex-flow: ` + (buttonsInRow ? 'row': 'column') + ` wrap;">
              `+(partial?`<ha-icon-button label="Partially close" class="sc-shutter-button sc-shutter-button-partial" data-command="partial" data-position="`+partial+`"><ha-icon icon="mdi:arrow-expand-vertical"></ha-icon></ha-icon-button>`:``)+`
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
            <div class="sc-shutter-selector">
              <div class="sc-shutter-selector-picture" style="width: ${width}; background-image: url(${sc_view_image})";>
                <div class="sc-shutter-selector-window" style="width: ${width}; background-image: url(${sc_window_image})";>
                </div>
                <div class="sc-shutter-selector-slide" style="width: ${width}; height: ${height}; background-image: url(${sc_slide_image});">
                  <img src="${sc_slide_bottom_image}"; style="width: 100%;position: absolute; bottom: 0";>
                </div>
                <div class="sc-shutter-selector-picker" style="top: ${_this.minPosition-_this.picker_overlap}px;"></div>`+
                (partial&&!offset?
                  `<div class="sc-shutter-selector-partial" style="top:`+_this.calculatePositionFromPercent(partial, invertPercentage, offset)+`px"></div>`:``
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
          _this.setPickerPosition(newPosition, picker, slide);
        };
           
        let mouseUp = function(event) {
          _this.isUpdating = false;
            
          let newPosition = event.pageY - _this.getPictureTop(picture);
          
          if (newPosition < _this.minPosition)
            newPosition = _this.minPosition;
          
          if (newPosition > _this.maxPosition)
            newPosition = _this.maxPosition;
          
          let percentagePosition = (newPosition - _this.minPosition) * (100-offset) / (_this.maxPosition - _this.minPosition);
          
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
      
        allShutters.appendChild(shutter);
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
              .sc-shutter-selector-picture 
              {
                z-index: 10;  
                position: relative; 
                margin: auto; 
                background-size: cover;
                min-height: 150px; 
                max-height: 100%; 
              }
              .sc-shutter-selector-window
              {
                z-index: 12;
                position: absolute;
                background-size: 100% 100%;
                width: 100%; 
                height: 100%; 
              }
              .sc-shutter-selector-slide 
              { 
                z-index: 11;  
                position: absolute; 
                background-position: bottom;
              }
              .sc-shutter-selector-picker 
              { 
                z-index: 13;  
                position: absolute; 
                top: 7px; 
                left: 0%; 
                width: 100%; 
                cursor: pointer; 
                height: 30px; 
                background-repeat: no-repeat; 
              }
              .sc-shutter-movement-overlay { 
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
    
      this.card.appendChild(allShutters);
      this.appendChild(style);
    }
    
    //Update the shutters UI
    entities.forEach(function(entity) {
      let entityId = entity;
      if (entity && entity.entity) {
        entityId = entity.entity;
      }

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

        _this.setPickerPositionPercentage(currentPosition, picker, slide, invertPercentage, offset);
        

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

  calculatePositionFromPercent(percent, inverted, offset) {
    let visiblePosition;
    if (inverted) {
      visiblePosition = offset?Math.min(100, Math.round(percent / offset * 100 )):percent;
    }
    else  {
      visiblePosition = offset?Math.max(0, Math.round((percent - offset) / (100-offset) * 100 )):percent;
    }
    return (this.maxPosition - this.minPosition) * (inverted?visiblePosition:100-visiblePosition) / 100 + this.minPosition;
  }

  
  getPictureTop(picture) {
      let pictureBox = picture.getBoundingClientRect();
      let body = document.body;
      let docEl = document.documentElement;

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
  
  setPickerPositionPercentage(percentage, picker, slide, inverted, offset) {
    let realPosition = this.calculatePositionFromPercent(percentage, inverted, offset);
  
    this.setPickerPosition(realPosition, picker, slide);
  }
  
  setPickerPosition(position, picker, slide) {
    if (position < this.minPosition)
      position = this.minPosition;
  
    if (position > this.maxPosition)
      position = this.maxPosition;
  
    picker.style.top = (position - this.picker_overlap) + 'px';
    //slide.style.height = (position - this.minPosition) + 'px';
    slide.style.height = (position ) + 'px';
  }
  
  updateShutterPosition(hass, entityId, position) {
    let shutterPosition = Math.round(position);
  
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
    this.maxPosition = 150;
    this.minPosition = 22;
    this.picker_overlap = 7;

    this.isUpdating = false;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return this.config.entities.length + 1;
  }
  
}

customElements.define("shutter-card", ShutterCard);