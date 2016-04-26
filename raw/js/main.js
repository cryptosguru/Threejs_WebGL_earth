'use strict';

/* global window, THREE: true */

var EarthWebGLDemo = EarthWebGLDemo || {};

/**
 * Entry point for Earth WebGL Demo
 * @param  {object} window
 */
((window, document) => {
    window.onload = () => {

        const defaultEyeSeparation = -0.04,
            defaultFocalLength = 15;

        let scene,
            camera,
            renderer,
            stereoEffect,
            directionalLightColor,
            directionalLight,
            ambientLightColor,
            ambientLight,
            atmosphereColor,
            settings,
            starField,
            earth,
            mouseX = 0,
            mouseY = 0,
            windowHalfX = window.innerWidth / 2,
            windowHalfY = window.innerHeight / 2;

        /**
         * Initialize scene
         */
        (function init() {

            //enable or disable virtual reality mode
            let vr = EarthWebGLDemo.urlParser.getQueryValueByKey('vr') === 'true';

            //setup scene and perspective camera with a fov of 45, a near plane at 1, and a far plane at 1000
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

            //setup renderer with antialiasing enabled
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);

            //setup setereoscopic renderer effect
            if (vr) {
                stereoEffect = new THREE.StereoEffect(renderer);
                stereoEffect.eyeSeparation = EarthWebGLDemo.urlParser.getQueryValueByKey('vr-eyeSeparation') || defaultEyeSeparation;
                stereoEffect.focalLength =  EarthWebGLDemo.urlParser.getQueryValueByKey('vr-focalLength') || defaultFocalLength;
                stereoEffect.setSize(window.innerWidth, window.innerHeight);

                camera.position.set(2.71, 2.12, -0.19);
                camera.lookAt(scene.position);
            }

            //add rendering div to the DOM
            let container = document.createElement('div');
            document.body.appendChild(container);
            container.appendChild(renderer.domElement);

            //create the sun
            directionalLightColor = new THREE.Color();
            directionalLight = new THREE.DirectionalLight(directionalLightColor);
            directionalLight.position.set(-1, 1, -10);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            //create ambient lighting
            ambientLightColor = new THREE.Color();
            ambientLight = new THREE.AmbientLight(ambientLightColor);
            scene.add(ambientLight);

            //allow the atmosphere color to be controlled by settings during render
            atmosphereColor = new THREE.Color();

            //import settings
            settings = EarthWebGLDemo.settings();

            //add stars to the scene
            starField = EarthWebGLDemo.starField();
            scene.add(starField.stars);

            //import the earth, but don't add it to the scene until the model is finished loading
            earth = EarthWebGLDemo.earth();
            earth.isAddedToScene = false;

            //allow the mouse to change the camera position when the user clicks and drags
            if (!stereoEffect) {
                document.addEventListener('mousemove', (event) => {
                    if (event.target && event.target.tagName === 'CANVAS' && event.buttons) {
                        mouseX = (event.clientX - windowHalfX) / 2;
                        mouseY = (event.clientY - windowHalfY) / 2;
                    }
                }, false);
            } else {
                EarthWebGLDemo.accelerometer(window, document, (x, y) => {
                    mouseX = x;
                    mouseY = y;
                });
            }

            //update renderer and camera aspect to the new size of the drawing area on window resize
            window.addEventListener('resize', () => {
                windowHalfX = window.innerWidth / 2;
                windowHalfY = window.innerHeight / 2;
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);

                if (stereoEffect) {
                    stereoEffect.setSize(window.innerWidth, window.innerHeight);
                }
            }, false);
        })();

        /**
         * Render method, called each time a frame is rendered
         */
        (function render() {

            //update sun with settings
            directionalLight.intensity = settings.sunIntensity;
            directionalLightColor.setStyle(settings.sunColor);
            directionalLight.color = directionalLightColor;

            //update ambient lighting with settings
            ambientLightColor.setStyle(settings.ambientLight);
            ambientLight.color = ambientLightColor;

            //update camera with mouse movements, but lock camera in vr mode
            //if (!stereoEffect) {
                camera.position.set(5.25, 0, 0);
                camera.position.x += (mouseX - camera.position.x) * 0.005;
                camera.position.y += (-mouseY - camera.position.y) * 0.005;
                camera.lookAt(scene.position);
            //}

            //when earth model is fully loaded (including materials and textures)
            if (earth.isLoaded) {

                //atmosphere settings
                atmosphereColor.setStyle(settings.atmosphereColor);
                earth.atmosphereMesh.visible = settings.atmosphereVisible;
                earth.atmosphereMaterial.color = atmosphereColor;
                earth.atmosphereMaterial.opacity = settings.atmosphereOpacity;
                earth.atmosphereMaterial.wireframe = settings.atmosphereWireframe;

                //clouds settings
                earth.cloudsMesh.visible = settings.cloudsVisible;
                earth.cloudsMaterial.opacity = settings.cloudsOpacity;
                earth.cloudsMaterial.wireframe = settings.cloudsWireframe;
                if (settings.cloudsRotate) {
                    earth.cloudsMesh.rotation.y += settings.cloudsVelocity;
                }

                //terrain settings
                earth.terrainMesh.visible = settings.terrainVisible;
                earth.terrainMaterial.bumpScale = settings.terrainBumpScale;
                earth.terrainMaterial.wireframe = settings.terrainWireframe;
                if (settings.terrainRotate) {
                    earth.terrainMesh.rotation.y += settings.terrainVelocity;
                }

                //add the earth to the scene only when it's fully loaded
                if (!earth.isAddedToScene) {
                    scene.add(earth.meshGroup);
                    earth.isAddedToScene = true;
                }
            }

            //render the scene and loop for next frame update
            if (stereoEffect) {
                stereoEffect.render(scene, camera);
            } else {
                renderer.render(scene, camera);
            }

            requestAnimationFrame(render);
        })();
    };
})(window, document);