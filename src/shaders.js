const glsl = x => x;
const vert = x => x;
const frag = x => x;


const sphere_vertex = vert`    
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}
`;


const game_fragment = frag`
        varying vec2 vUv;

        uniform vec2 resolution;
        uniform sampler2D texture0;
        uniform float dist;
        uniform float diff_dist;
        uniform float angle_dist;
        uniform float time;
        uniform float opacity;
        uniform float sound;

        const mat3 sobelX = mat3(-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0)/8.0;
        const mat3 sobelY = mat3(-1.0,-2.0,-1.0, 0.0, 0.0, 0.0, 1.0, 2.0, 1.0)/8.0;
        const mat3 gauss = mat3(1.0, 2.0, 1.0, 2.0, 4.0-16.0, 2.0, 1.0, 2.0, 1.0)/8.0;


        vec3 conv3x3(vec2 uv, mat3 fil) {
            vec3 a = vec3(0.0);
            for (int y=0; y<3; ++y)
            for (int x=0; x<3; ++x) {
              vec2 p = uv * resolution + vec2(float(x-1), float(y-1));
              a += fil[y][x] * texture2D(texture0, p / resolution).xyz;
            }
            return a;
        }

        void main() {
            vec2 uv = vec2(1. - abs(vUv.x - 0.5) * 2., vUv.y);

            vec4 origin_color = texture2D(texture0, uv + vec2(sin(sound), cos(sound)) / 10000.);
            
            vec2 wooUv = uv * (1. + dist * 0.02 * sin(10. * time + sin(uv) * cos(uv) * 20.));
            
            vec3 sobel_color = (conv3x3(wooUv, sobelX * sin(sound * uv.x) / 10.) + conv3x3(wooUv, sobelY * cos(sound * uv.y) / 10.)) * 10.;

            float fade = smoothstep(0.05, 0.5 , dist + normalize(sound) / 10.);
            float opacity_fade = smoothstep(0., 0.5, diff_dist) + 0.5;

            vec3 frontcolor = mix(origin_color.xyz, sobel_color.xyz, fade + 0.15);
            
            float polar = smoothstep(0.05, 0.15, vUv.y) *
            (1. - smoothstep(0.8, 0.9, vUv.y));
            
            vec3 backcolor = vec3(length(conv3x3(vec2(
                fract(vUv.y + uv.x * sin(uv.x + sin(time * 2.4 + uv.y * 100.) * 0.2) * cos(vUv.x * 0.2 - cos(time * 1.9 + uv.x * 320.) * 0.3))
            , uv.y), gauss))) * 20.;

            float angle_fade = smoothstep(1.5, 2.6, angle_dist);

            // smooth fade
            backcolor *= smoothstep(0.01, 0.2, pow((vUv.x - 0.75) * 2., 2.) + pow(vUv.y - 0.5, 2.));
            backcolor *= angle_fade;

            float front = 
                (1. - smoothstep(0.45, 0.52 , vUv.x)) * 
                (smoothstep(0., 0.1, vUv.x)) *
                polar *
                (1. - angle_fade);

            gl_FragColor = mix(
                vec4(opacity_fade * backcolor, 0.5),
                vec4(opacity_fade * frontcolor, origin_color.w),
                front
            ) * vec4(vec3(1.), opacity);
        }
    `;


const editor_fragment = frag`

    varying vec2 vUv;

    uniform vec2 resolution;
    uniform sampler2D texture0;
    uniform float dist;
    uniform float diff_dist;
    uniform float angle_dist;
    uniform float time;
    uniform float opacity;
    uniform float grid;

    void main() {
        vec2 uv = vec2(1. - abs(vUv.x - 0.5) * 2., vUv.y);

        vec3 color = texture2D(texture0, uv).xyz;

        uv = uv * 20.;

        float gridX = mod(uv.x, 1.) > .95 ? 1. : 0. ;
        float gridY = mod(uv.y, 1.) > .95 ? 1. : 0. ;

        color += gridX * vec3(1., 0., 0.) * grid;
        color += gridY * vec3(0., 0., 1.) * grid;
        
        gl_FragColor = vUv.x < .5 ? vec4(color, opacity) : vec4(0.);

    }
`;



const plane_vertex = vert`   
    uniform float time;
    varying vec2 vUv;
    void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
    `;

const plane_fragment_shader = frag`
    precision mediump float;
    precision mediump int;

    // uniform float time;
    uniform float posz;

    varying vec2 vUv;

    void main() {
        vec3 color = vec3(0.);
        vec2 uv = vUv * 10. - posz * 10.;

        float gridX = mod(uv.x, 1.) > .95 ? 1. : 0. ;
        float gridY = mod(uv.y, 1.) > .95 ? 1. : 0. ;

        color += (gridX + gridY) * vec3(1., 0., 1.) / 10. ;

        gl_FragColor = vec4(color, 1.);
    }
`;


const sky_fragment = frag`
    varying vec2 vUv;

    uniform float sound;
    uniform float time;

    float circle(vec2 p, float r) {
        return length(p) - pow(r, 2.);
    }

    mat2 rot(float a) { 
        return mat2(cos(a), -sin(a), sin(a), cos(a));
    }

    void main() {
        vec2 uv = vec2(fract(vUv.x), fract(vUv.y));
        
        vec3 color = cos(circle(sin(uv * sound / 10.), .1)) * vec3(uv.x, 0.,  uv.y) / 5.;
        // vec3 color = vec3(uv.y, uv.x, 0.);

        gl_FragColor = fract(uv.x - .25) < .5 ? vec4(color, 1. - uv.x): vec4(0.);
    }

`;
