const START_SCENE = 'media/pano/sky.jpg';


const vid1 = document.createElement("video");
vid1.setAttribute("id", "rocks");
vid1.setAttribute("src", "media/vid/rocks.mp4");
vid1.setAttribute("hidden", true);
vid1.setAttribute("autoplay", true);
vid1.setAttribute("loop", true);
// vid1.setAttribute("muted", true);
// console.log('vid1', vid1);
document.body.appendChild(vid1);

const video = document.getElementById( 'rocks' );
video.muted = "muted";
// video.setAttribute("muted", true);
const vidtexture = new THREE.VideoTexture( video );


const MEDIA_MAP =  {
    "media/pano/sky.jpg": {
        position: [0, 0, 0],
        rotation: [0, 0, 0]
    },

    "media/pano/mirror.jpg": {
        position: [0, 0, -10.427600000000083],
        rotation: [0, 0, 0]
    },

    "media/pano/volnolom.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/sunset1.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/beach.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/beach2.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/beach3.jpg": {
        position: [0, 0, -5.209999999999996],
        rotation: [0, 0, 0]
    },

    "media/pano/beach4.jpg": {
        position: [0, 0, -6.069400000000141],
        rotation: [0, 0, 0]
    },

    "media/pano/heart.jpg": {
        position: [0, 0, -7.045200000000132],
        rotation: [0, 0, 0]
    },

    "media/pano/dead2.jpg": {
        position: [0, 0, -7.9272000000001155],
        rotation: [0, 0, 0]
    },

    "media/pano/end.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/forest.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/vid/rocks.mp4": {
        position: [0, 0, -4.230000000000004],
        rotation: [0, 0, 0]
    },

    "media/pano/kaliningrad.jpg": {
        position: [0.08599371155190408, -0.10036975023420398, -0.8570687456741443],
        rotation: [-0.11657717693857553, -0.0993257277018555, -0.011612215547381956]
    },

    "media/pano/kanal.jpg": {
        position: [0, 0, -2.2685999999999993],
        rotation: [0, 0, 0]
    },

    "media/pano/kant.jpg": {
        position: [0, 0, -3.2500000000000027],
        rotation: [0, 0, 0]
    },

    "media/pano/mayak.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/moon.jpg": {
        position: [0, 0, -9.6814000000001],
        rotation: [0, 0, 0]
    },

    "media/pano/volnolom3.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/volnolom2.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/tree.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/tower_inside.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/tower.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/sunset6.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/sunset4.jpg": {
        position: [0, 0, -8.886200000000107],
        rotation: [0, 0, 0]
    },

    "media/pano/sunset3.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },

    "media/pano/sunset2.jpg": {
        position: [0, 0, -15],
        rotation: [0, 0, 0]
    },
};