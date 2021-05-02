const VELOCITY = 1.4;
const TENSION = 0.2;
const TENSION_Z = 0.5;
const TENSION_RELAX = 4;


function move(t, dt, state) {
    let forward_velocity = (state.forward - state.backward) * dt * VELOCITY;
    let right_velocity = (state.right - state.left) * dt * VELOCITY;

    let all_velocity = Math.abs(forward_velocity) + Math.abs(right_velocity);

    let up_velocity = (state.up - state.down) * dt * VELOCITY;

    state.controls.moveRight(right_velocity);
    state.controls.moveForward(forward_velocity);
    state.controls.getObject().position.y += (
        Math.sin(state.camera.rotation.x) * forward_velocity + 
        up_velocity
    );
    let d = new THREE.Vector3;
    state.vessel_position = JSON.stringify(state.vessel.position);
    state.camera_position = JSON.stringify(state.camera.getWorldPosition(d));

    return all_velocity
}


function game_update(t, dt, state) {

    let all_velocity = move(t, dt, state);

    let vrpos = state.vrcontroller.position;
    state.asterisk.position.set(vrpos.x, vrpos.y, vrpos.z - .5);

    // state.camera_rotation = state.camera.rotation;
    // state.camera_position = state.camera.position;

    let camera_yaw = state.camera.clone().rotation.reorder("XZY").y;

    let distance_items = Object.keys(state.panorama)
    .map(name => ({name, value: state.panorama[name]}))
    .filter(item => (item.name !== state.movable_scene || !state.edit))
    .map(item => {
        let distance =
            Math.pow(item.value.position.x - state.vessel.position.x, 2) +
            Math.pow(item.value.position.y - state.vessel.position.y, 2) +
            Math.pow(item.value.position.z - state.vessel.position.z, 2);

        // let angle_distance = Math.pow(camera_yaw - item.value.clone().rotation.reorder("XZY").y, 2);
        // distance += angle_distance / 300.;

        return {name: item.name, distance};
    })
    .sort((a, b) => a.distance - b.distance);

    state.current_scene = distance_items[0].name;
    state.min_distance = distance_items[0].distance;

    Object.keys(state.panorama).forEach(name => {state.panorama[name].visible = false;});

    let diff_distance = Math.abs(distance_items[0].distance - distance_items[1].distance);
    
    distance_items.slice(0, 1).forEach(item => {
        let near_item = state.panorama[item.name];

        near_item.visible = true;
        near_item.material.uniforms.dist.value = state.edit ? 0. : item.distance;
        near_item.material.uniforms.diff_dist.value = state.edit ? 1. : diff_distance;
        // near_item.material.uniforms.opacity.value = state.edit ? state.scene_opacity : 1.;

        let near_lookat = (new THREE.Vector3(1, 0, 0)).applyEuler(near_item.rotation);
        let camera_lookat = (new THREE.Vector3(1, 0, 0)).applyEuler(state.camera.rotation) ;

        near_item.material.uniforms.angle_dist.value = camera_lookat.angleTo(near_lookat);

        near_item.material.uniforms.time.value = t;

        if (near_item.name.endsWith("mp4")) {
            near_item.material.uniforms.texture0.value = vidtexture;
        }
 

        state.min_angle_distance = near_item.material.uniforms.angle_dist.value;

        // tension
        if (!state.edit) {
            if(all_velocity > 0) {
                state.controls.getObject().position.x += 
                    (near_item.position.x - state.vessel.position.x) * dt * TENSION;
                state.controls.getObject().position.y += 
                    (near_item.position.y - state.vessel.position.y) * dt * TENSION;
                
                state.controls.getObject().position.z += 
                    (near_item.position.z - state.vessel.position.z) * dt * TENSION_Z;
            } else {
                state.controls.getObject().position.x += 
                    (near_item.position.x - state.vessel.position.x) * dt * TENSION_RELAX;
                state.controls.getObject().position.y += 
                    (near_item.position.y - state.vessel.position.y) * dt * TENSION_RELAX;
                state.controls.getObject().position.z += 
                    (near_item.position.z - state.vessel.position.z) * dt * TENSION_RELAX;
            }
        }

        
    });
 
}

function game_init(state) {
    state.scene.background = new THREE.Color('black');

    state.camera = new THREE.PerspectiveCamera(
        80, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    state.camera.position.set(0., 0., 0.);
    state.camera.rotation.order = 'XYZ';


    // audio 
    const listener = new THREE.AudioListener();
    state.camera.add(listener);
    const sound = new THREE.Audio(listener);
    // state.sound.panner.setPosition(0, 0, -1);
    // state.sound.setRolloffFactor(10); 
    // state.sound.setMaxDistance(0.1);
    // state.sound.setDistanceModel("exponential");

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'media/tide_low.mp3', function(buffer) {
        sound.setBuffer( buffer );
        sound.setLoop(true);
        sound.play();
    });


    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.color.set('white');
    light.position.set(3, 1, 5);
    state.scene.add(light);
    
    const ambient = new THREE.AmbientLight(0x010101, 0.4);
    ambient.color.set('white');
    state.scene.add(ambient);

    const blue_material = new THREE.MeshLambertMaterial({
        color: 'blue',
        transparent: true,
        opacity: 0.3,
    });
 


    let uniforms = { 
        time: {value: 0.0},
        resolution: {value: [window.innerWidth, window.innerHeight]},

    };
    let grid_material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: plane_vertex[0], 
        fragmentShader: plane_fragment_shader[0],
        side: THREE.DoubleSide

    });

    const grid_geometry = new THREE.PlaneGeometry(2, 2, 2 );
    const grid = new THREE.Mesh(grid_geometry, grid_material);
    grid.rotation.x = - Math.PI / 2;
    grid.position.set(0, 0, 0);
    state.grid = grid;

    const size = 10;
    const divisions = 1000;

    if (EDIT_MODE) {
        const gridHelper = new THREE.GridHelper( size, divisions );
        state.scene.add( gridHelper );
    }

    const video = document.getElementById( 'rocks' );
    const vidtexture = new THREE.VideoTexture( video );

    state.panorama = {};


    // fixed panorama
    Object.keys(MEDIA_MAP).forEach(name => {

        let texture = null;
        const loader = new THREE.TextureLoader();
        
        if (name.endsWith('mp4')) {
            texture = vidtexture;

        }

        else {
            texture = loader.load(name);
            
        }

        // console.log("texture, ", texture);


        let sphere_uniforms = {
            texture0: { type: "t", value: texture}, 
            // texture0: { type: "t", value: vidtexture}, 
            resolution: {value: [window.innerWidth, window.innerHeight]},
            dist: {value: 1.0},
            diff_dist: {value: 1.0},
            angle_dist: {value: 0.0},
            time: {value: 0.0},
            opacity: {value: 1.0},
            grid: {value: 0.0},
        };

        let sphere_fragment = game_fragment;
        if (EDIT_MODE) {
            sphere_fragment = editor_fragment;
        }
        
    
        const sphere_shader = new THREE.ShaderMaterial({
            uniforms: sphere_uniforms,
            vertexShader: sphere_vertex[0], //THREE.DefaultVertex,
            // fragmentShader: editor_fragment[0],
            fragmentShader: sphere_fragment[0],
            side: THREE.BackSide,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        const geometry = new THREE.SphereGeometry(1, 100, 100, 0, Math.PI * 2. , Math.PI / 4, (2 * Math.PI) / 4. );
        const mesh = new THREE.Mesh(geometry, sphere_shader);
        mesh.position.x = MEDIA_MAP[name].position[0];
        mesh.position.y = MEDIA_MAP[name].position[1];
        mesh.position.z = MEDIA_MAP[name].position[2];
        mesh.rotation.x = MEDIA_MAP[name].rotation[0];
        mesh.rotation.y = MEDIA_MAP[name].rotation[1];
        mesh.rotation.z = MEDIA_MAP[name].rotation[2];
        mesh.rotation.order = 'XYZ';
        mesh.scale.set(1, 1, -1);
        state.scene.add(mesh);
        state.panorama[name] = mesh;

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 32, 32),         
            sphere_shader
        );

        sphere.position.x = MEDIA_MAP[name].position[0];
        sphere.position.y = MEDIA_MAP[name].position[1];
        sphere.position.z = MEDIA_MAP[name].position[2];

        state.scene.add(sphere);
    });
   
    

    state.up = 0;
    state.down = 0;
    state.left = 0;
    state.right = 0;
    state.forward = 0;
    state.backward = 0;

    state.offset_x = 0;
    state.offset_y = 0;
    state.offset_z = 0;

    state.min_distance = 0.1;
    state.min_angle_distance = 0.1;
    
    state.current_scene = START_SCENE;
    let current_position = state.panorama[state.current_scene].position;


    const vessel = new THREE.Group();
    vessel.add(state.camera);
    vessel.add(grid);

    state.vessel = vessel;


    // controller 
    state.controls = new THREE.PointerLockControls(state.vessel, document.body);
    state.controls.getObject().position.x = current_position.x;
    state.controls.getObject().position.y = current_position.y;
    state.controls.getObject().position.z = current_position.z;



         
    state.edit = false;
    state.move_scene = false;
    state.rotate_scene = false;
    state.grab_scene = false;
    state.stationary_scene = null;
    state.movable_scene = null;
    state.grab_distance = 1.
    state.scene_opacity = .5;
    state.scene_grid = false;
    state.all_visible = false;
    


    // torus knot with 6 pointy ends, like in symbol "*"
    const radius =  3.4 / 50.;  
    const tubeRadius =  1.6 / 50.;  
    const radialSegments =  3;
    const tubularSegments =  29;  
    const p =  1;  
    const q =  6; 
    const asterisk_geometry = new THREE.TorusKnotGeometry(
        radius, tubeRadius, tubularSegments, radialSegments, p, q);



    const asterisk = new THREE.Mesh(
    //   new THREE.SphereGeometry(0.02, 32, 32),         
        asterisk_geometry,  
        blue_material
    );

    
    state.scene.add(asterisk);

    state.vrcontroller = null;
    state.asterisk = asterisk;
    state.move_forward = false;
    state.vessel_position = JSON.stringify(vessel.position);
    state.camera_position = state.vessel_position;

    state.scene.add(vessel);



    return state;
}


function game_handle_key(code, is_press, state) {

    if(code === 'ArrowUp' || code === 'KeyW') {
        state.forward = is_press ? 1 : 0;
    }
    if(code === 'ArrowDown' || code === 'KeyS') {
        state.backward = is_press ? 1 : 0;
    }
    if(code === 'ArrowLeft' || code === 'KeyA') {
        state.left = is_press ? 1 : 0;
    }
    if(code === 'ArrowRight' || code === 'KeyD') {
        state.right = is_press ? 1 : 0;
    }
    if(code === "KeyE") {
        state.up = is_press ? 1 : 0;
    }
    if(code === "KeyQ") {
        state.down = is_press ? 1 : 0;
    }

    if(code == "KeyF" && is_press) {
        state.sound.play();
    }    
    
    if(code == "KeyM" && is_press) {
        state.move_scene = !state.move_scene;
    }

    if(code == "KeyR" && is_press) {
        state.rotate_scene = !state.rotate_scene;
    }

    if(code == "KeyY" && is_press) {
        state.edit = !state.edit;
    }

    if(code == "KeyC" && is_press) {
        state.stationary_scene = state.movable_scene;
        state.movable_scene = state.current_scene;

    }    

    if(code == "KeyG" && is_press) {
        state.grab_scene = !state.grab_scene;

    }    

    if(code == "KeyH" && is_press) {
        let temp = state.stationary_scene;
        state.stationary_scene = state.movable_scene; 
        state.movable_scene = temp;

    }    


    if(code == "KeyZ" && is_press) {
        positions = "const MEDIA_MAP =  {"

        Object.keys(state.panorama).forEach((name) => {
            positions += `
                "${name}": {
                    position: [${state.panorama[name].position.x}, ${state.panorama[name].position.y}, ${state.panorama[name].position.z}],
                    rotation: [${state.panorama[name].rotation.x}, ${state.panorama[name].rotation.y}, ${state.panorama[name].rotation.z}]
                },
            `;
        });

        positions += "};";    
   
        console.log(positions);
        
    }
}