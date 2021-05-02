import { VRButton } from '../lib/vrbutton.js';


const renderer = new THREE.WebGLRenderer({alpha: false});
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType( 'local' );


function app() {
    const gui = new dat.GUI();

    if (!EDIT_MODE) {
        gui.hide();
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let locked = false;

    let state = {};
    state.scene = new THREE.Scene();

    state = game_init(state);

    function onWindowResize() {
        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    window.addEventListener('resize', onWindowResize);

    document.addEventListener('keydown', (event) => {
        if(event.code !== "F11" && event.code !== "F12" && event.code !== "F5") {
            event.preventDefault();
        }

        if(event.key === "Control") {
            if(!locked) {
                state.controls.lock();
                locked = true;
            } else {
                state.controls.unlock();
                locked = false;
            }
        } else {
            game_handle_key(event.code, true, state);
        }
    });

    document.addEventListener('keyup', (event) => {
        if(event.code !== "F11" && event.code !== "F12" && event.code !== "F5") {
            event.preventDefault();
        }

        if(event.key === "Control") {
        } else {
            game_handle_key(event.code, false, state);
        }
    });

    window.addEventListener('mousedown', (evt) => {
        
    });
    window.addEventListener('mousemove', (evt) => {
        
    });
    window.addEventListener('mouseup', (evt) => {
        
    });


    let vrcontroller = renderer.xr.getController( 0 );

 
    vrcontroller.addEventListener( 'selectstart', () => {state.forward = 1;} );
    vrcontroller.addEventListener( 'selectend',  () => {state.forward = 0;});

    state.vrcontroller = vrcontroller;
    state.vessel.add(vrcontroller); 
    state.scene.add( vrcontroller );


    let gui_updater = [];

    gui.add(state, 'offset_x')
        .min(-Math.PI / 4.).max(Math.PI / 4.).step(0.0001)
        .listen().onChange(value => state.offset_x = value);
    gui.add(state, 'offset_y')
        .min(-Math.PI / 4.).max(Math.PI / 4.).step(0.0001)
        .listen().onChange(value => state.offset_y = value);
    gui.add(state, 'offset_z')
        .min(-Math.PI / 4.).max(Math.PI / 4.).step(0.0001)
        .listen().onChange(value => state.offset_z = value);
    
    gui_updater.push(
        gui.add(state, "min_distance")
    );
   
    gui_updater.push(
        gui.add(state, 'current_scene')
    );

    gui_updater.push( 
        gui.add(state, 'stationary_scene', Object.keys(
        state.panorama)) 
        .listen().onChange(value => state.stationary_scene = value)
    );

    gui_updater.push( 
        gui.add(state, 'movable_scene', Object.keys(
        state.panorama)) 
        .listen().onChange(value => state.movable_scene = value)
    );

    gui.add(state, 'edit').listen().onChange(value => {state.edit = value;});  
    gui.add(state, 'move_scene').listen().onChange(value => {state.move_scene = value;});  
    gui.add(state, 'rotate_scene').listen().onChange(value => {state.rotate_scene = value;});  
    gui.add(state, 'grab_scene').listen().onChange(value => {state.grab_scene = value;});  
    gui.add(state, 'scene_opacity')
    .min(0.).max(1.).step(0.1)
    .listen().onChange(value => state.scene_opacity = value);
    gui.add(state, 'scene_grid').listen().onChange(value => {state.scene_grid = value;});  

    gui.add(state, 'all_visible').listen().onChange(value => { Object.keys(state.panorama).forEach(name => {state.panorama[name].visible = value;})});
    
    gui_updater.push(
        gui.add(state, "min_angle_distance")
    );


    let time = 0;
    let prev_time = (+new Date());
  
        
    function animate() {
    
        let now = (+new Date());
        let dt = (now - prev_time) / 1000;
        prev_time = now;
        
        time += dt;
    
        if (state.edit) {
            editor_update(time, dt, state);
        }
        else {
            game_update(time, dt, state);
        }
                

        renderer.render(state.scene, state.camera);
        gui_updater.forEach(x => x.updateDisplay());        
        
    }    

    renderer.setAnimationLoop( animate ); 
}
    
window.onload = app;
