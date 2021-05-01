console.log('creating video textures');

const vid1 = document.createElement("video");
vid1.setAttribute("id", "rocks");
vid1.setAttribute("src", "media/rocks.mp4");
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
    "media/photo_2021-04-23_20-53-45.jpg": {
        position: [0, 0, 0],
        rotation: [0.03640000000000001, 0.019599999999999992, 0]
    },

    "media/photo_2021-04-25_16-21-34.jpg": {
        position: [-0.015593511619837599, -0.21331340482133032, -0.08877687461900391],
        rotation: [0.2792950671526326, 0.020796216677075846, 0.04267816919984013]
    },
};