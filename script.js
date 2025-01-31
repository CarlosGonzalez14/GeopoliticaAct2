// Crear la escena
const scene = new THREE.Scene();

// Crear la cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Define el zoom por defecto ajustando la posición z

// Crear el renderizador y agregarlo al DOM
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles de órbita
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Limitar el zoom in y zoom out
controls.minDistance = 1.2; // Distancia mínima a la esfera para evitar atravesar la malla
controls.maxDistance = 10;  // Distancia máxima para que no se aleje demasiado

// Definir un nivel de zoom por defecto (opcional)
camera.zoom = 3; // Ajusta el zoom predeterminado
camera.updateProjectionMatrix(); // Actualizar la proyección para aplicar el zoom

// Crear la geometría de la primera esfera (Tierra)
const sphereGeometry = new THREE.SphereGeometry(1, 720, 360);
const material = new THREE.MeshPhongMaterial();
const texture = new THREE.TextureLoader().load("img/texturaH1.png");
material.map = texture;
const displacementMap = new THREE.TextureLoader().load("img/relieve.jpg");
material.displacementMap = displacementMap;
material.displacementScale = 0.1;
const sphere = new THREE.Mesh(sphereGeometry, material);
scene.add(sphere);

// Cargar la textura de temperatura (temp.png)
const temperatureTexture = new THREE.TextureLoader().load('img/temp.png');
temperatureTexture.minFilter = THREE.LinearFilter;
temperatureTexture.magFilter = THREE.LinearFilter;
temperatureTexture.wrapS = THREE.RepeatWrapping;
temperatureTexture.wrapT = THREE.RepeatWrapping;

// Shader personalizado para la escala de temperatura (de azul a rojo)
const temperatureShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        temperatureMap: { value: temperatureTexture }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D temperatureMap;
        varying vec2 vUv;

        void main() {
            // Obtener el valor de la textura en escala de grises
            vec4 tempValue = texture2D(temperatureMap, vUv);
            float temperature = tempValue.r;

            // Interpolar entre azul (frío) y rojo (calor)
            vec3 coldColor = vec3(0.0, 0.0, 1.0); // Azul
            vec3 hotColor = vec3(1.0, 0.0, 0.0); // Rojo

            vec3 finalColor = mix(coldColor, hotColor, temperature);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
    transparent: true,
    opacity: 0.6,
});

// Material turquesa por defecto
const turquoiseMaterial = new THREE.MeshPhongMaterial({
    color: 0x40E0D0,  // Color turquesa
    transparent: true,
    opacity: 0.6
});

const newColorMaterial = new THREE.MeshPhongMaterial({
    color: 0x121526,  // Nuevo color oscuro
    transparent: true,
    opacity: 0.6
});

// Actualiza la segunda esfera con el nuevo material
let secondSphereGeometry = new THREE.SphereGeometry(1.005535, 720, 360);
let secondSphere = new THREE.Mesh(secondSphereGeometry, newColorMaterial);
scene.add(secondSphere);

// Luz ambiental y direccional (siempre es de día)
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Aumentar la intensidad de la luz ambiental
scene.add(ambientLight);

const sunlight = new THREE.DirectionalLight(0xffffff, 1.5);
sunlight.position.set(10, 10, 10).normalize();
sunlight.castShadow = true;
scene.add(sunlight);

// Raycaster para detectar intersecciones
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Array de coordenadas con la propiedad "info"
const coordinates = [
    {
      "lat": 30.5852,
      "lon": 32.2654,
      "info": {
        "titulo": "Canal de Suez: Clave para el Comercio Global",
        "contenido": "Ubicado en Egipto, conecta el Mar Mediterráneo con el Mar Rojo, permitiendo el tránsito marítimo entre Europa y Asia sin rodear África. Es crucial para el comercio global, ya que maneja aproximadamente el 12% del comercio mundial.",
        "origen": "https://cadenaser.com/resizer/v2/GGLGCS73DVOLVID3SIIOFY45FI.jpg?auth=89529ecb0d534b78ad57d642da573c8e9e77e557b299108c8fc02354050ebb11&quality=70&width=1200&height=900&smart=true"
      }
    },
    {
      "lat": -22.9068,
      "lon": -67.6700,
      "info": {
        "titulo": "Cinturón de Litio: Recurso Estratégico",
        "contenido": "Ubicado en Argentina, Bolivia y Chile, contiene las mayores reservas de litio del mundo. Este metal es clave para la fabricación de baterías y la transición energética global, lo que lo convierte en un recurso estratégico para la industria tecnológica.",
        "origen": "https://media.realinstitutoelcano.org/wp-content/uploads/2018/09/salar-atacama.jpg"
      }
    },
    {
      "lat": 48.3794,
      "lon": 31.1656,
      "info": {
        "titulo": "Guerra Rusia-Ucrania: Impacto Geopolítico y Energético",
        "contenido": "Desde 2022, este conflicto ha redefinido la seguridad europea y el equilibrio energético mundial. Rusia es un proveedor clave de gas y petróleo, mientras que Ucrania es un productor agrícola crucial.",
        "origen": "https://elordenmundial.com/wp-content/uploads/2024/04/guerra-rusia-ucrania.jpg"
      }
    },
    {
      "lat": 26.5653,
      "lon": 56.2500,
      "info": {
        "titulo": "Estrecho de Ormuz: Punto Crítico del Transporte de Petróleo",
        "contenido": "Ubicado entre Irán y Omán, es el paso marítimo más estratégico para el transporte de petróleo, por donde fluye aproximadamente el 20% del crudo mundial. Cualquier conflicto en la región puede desestabilizar los mercados energéticos.",
        "origen": "https://www.revistaeyn.com/binrepository/1200x784/0c0/0d0/none/26086/QVYD/estrechoormuz_7233892_20240415091147.jpg"
      }
    },
    {
      "lat": -2.8762,
      "lon": 23.6560,
      "info": {
        "titulo": "Cuenca del Congo: Riqueza Mineral y Biodiversidad",
        "contenido": "Rica en coltán, cobalto y diamantes, esenciales para la industria tecnológica. Su biodiversidad y recursos hídricos la convierten en una zona clave para la seguridad ambiental global, pero enfrenta conflictos y explotación ilegal.",
        "origen": "https://es.greenpeace.org/es/wp-content/uploads/sites/3/2017/11/62a58d8f-gp0str4qg_pressmedia-2100x1401.jpg"
      }
    },
    {
      "lat": 34.1498,
      "lon": 76.8259,
      "info": {
        "titulo": "Cachemira: Región en Disputa Nuclear",
        "contenido": "Disputada entre India y Pakistán, ambos con armas nucleares. Su importancia radica en su ubicación estratégica, acceso a recursos hídricos y su impacto en la seguridad del sur de Asia.",
        "origen": "https://img.eldefinido.cl/portadas/1200/2016-08-22-5878TGR2968.jpg"
      }
    },
    {
      "lat": 45.4641,
      "lon": 147.7500,
      "info": {
        "titulo": "Islas Kuriles: Disputa entre Rusia y Japón",
        "contenido": "Archipiélago en disputa desde la Segunda Guerra Mundial. Su control otorga ventajas militares y acceso estratégico al Pacífico Norte, siendo un punto de tensión entre ambos países.",
        "origen": "https://lh5.googleusercontent.com/p/AF1QipMKJRdhT5JXd0yDdLXR0bH5enz5YpnRTHv751A5=w743-h429-n-k-no"
      }
    },
    {
      "lat": 51.9225,
      "lon": 4.4792,
      "info": {
        "titulo": "Rotterdam: El Puerto Más Grande de Europa",
        "contenido": "El principal nodo logístico de Europa, maneja grandes volúmenes de carga y energía. Es clave para el comercio entre Europa, Asia y América, con infraestructura avanzada y relevancia estratégica.",
        "origen": "https://www.amsterdam.net/es/wp-content/uploads/sites/93/rotterdam-hd.jpg"
      }
    }
];  

// Función para cerrar el modal cuando se hace clic fuera de él
window.addEventListener('click', function(event) {
    const modal = document.getElementById('info-modal');
    const isClickInside = modal.contains(event.target);

    // Si el clic es fuera del modal y el modal está visible, ciérralo
    if (!isClickInside && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('info-modal');
    const close = document.getElementById('close-modal');
    const isClickInside = close.contains(event.target);

    // Si el clic es fuera del modal y el modal está visible, ciérralo
    if (isClickInside) {
        modal.style.display = 'none';
    }
});

// Función para convertir coordenadas geográficas a coordenadas 3D
function convertLatLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180); // Convertir latitud a phi
    const theta = (lon + 180) * (Math.PI / 180); // Convertir longitud a theta

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// Función para agregar pines en las coordenadas
const pins = [];



// Función para agregar pines en las coordenadas (con círculo y vara con resplandor)
// Función para agregar pines en las coordenadas (usando CircleGeometry para trazar círculos con un anillo animado)

// Función para agregar pines en las coordenadas (usando CircleGeometry para trazar círculos con un anillo animado)
function addPin(lat, lon, info) {
// Geometría del círculo
const circleGeometry = new THREE.CircleGeometry(0.05, 32);  // Círculo con radios pequeños y muchos segmentos para suavizar
const circleMaterial = new THREE.MeshBasicMaterial({
color: 0xff0000,  // Color rojo
side: THREE.DoubleSide,  // Hacer visible el círculo desde ambos lados
transparent: true,
opacity: 0.8  // Ligera transparencia
});
const circle = new THREE.Mesh(circleGeometry, circleMaterial);

// Posicionar el círculo en la superficie de la esfera
const position = convertLatLonToVector3(lat, lon, 1.08);
circle.position.copy(position);

// Colocar el círculo plano en la superficie de la esfera
const normalDirection = position.clone().normalize();
circle.lookAt(position.clone().add(normalDirection)); // Alinear el círculo con la esfera

// Agregar información al círculo
circle.userData.info = info;

// Animación de anillo pulsante
let scaleFactor = 1;
let growing = true; // Controla si el anillo está creciendo o encogiendo

function animateRing() {
if (growing) {
    scaleFactor += 0.005; // Crecer ligeramente
    if (scaleFactor >= 1.2) growing = false; // Limitar crecimiento
} else {
    scaleFactor -= 0.005; // Encoger ligeramente
    if (scaleFactor <= 1.0) growing = true; // Limitar encogimiento
}
circle.scale.set(scaleFactor, scaleFactor, scaleFactor); // Aplicar la escala al círculo
}

// Actualizar la animación de los pines dentro de la función de animación principal
function updatePin() {
animateRing();
}

// Agregar la función de actualización al círculo
circle.update = updatePin;

// Agregar el círculo a la esfera
sphere.add(circle);

// Almacenar el círculo para la detección de clics
pins.push(circle);
}





// Agregar pines para cada coordenada
coordinates.forEach((coord, index) => addPin(coord.lat, coord.lon, coord.info));

// Detectar clics en los pines usando raycaster
function onMouseClick(event) {
    // Normalizar las coordenadas del clic
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Establecer el raycaster desde la cámara y las coordenadas del clic
    raycaster.setFromCamera(mouse, camera);

    // Detectar intersección con los pines
    const intersects = raycaster.intersectObjects(pins);

    // Si hubo intersección
    if (intersects.length > 0) {
        const pinClicked = intersects[0].object;
        const info = pinClicked.userData.info;

        // Mostrar la información del pin en el modal
        const modal = document.getElementById('info-modal');
        const modalContent = document.getElementById('modal-content');
        const modalHeader = document.getElementById('modal-header');
        const modalImage = document.getElementById('modal-image');
        modalHeader.textContent = info.titulo;
        modalContent.textContent = info.contenido;
        modalImage.src = info.origen;
        modal.style.display = 'block';
    }
}

// Escuchar eventos de clic
window.addEventListener('click', onMouseClick);

// // Cerrar el modal
// const closeModalButton = document.getElementById('close-modal');
// closeModalButton.addEventListener('click', () => {
//     document.getElementById('info-modal').style.display = 'none';
// });

// Función para alternar entre el shader de temperatura y el material turquesa
const temperatureSwitch = document.getElementById('temperature-switch');
temperatureSwitch.addEventListener('change', (event) => {
    if (event.target.checked) {
        // Activar el shader de temperatura
        secondSphere.material = temperatureShaderMaterial;
    } else {
        // Volver al material turquesa
        secondSphere.material = turquoiseMaterial;
    }
});

// Función demo para ocultar controles, luces y detener la rotación
function demo(activate) {
    const controlsContainer = document.getElementById('controls-container');
    const demoSwitch = document.getElementById('demo-switch'); // Referencia al checkbox del demo

    if (activate) {
        // Ocultar todos los botones y sliders
        controlsContainer.style.display = 'none';

        // Ocultar todos los pines al iniciar el modo demo
        pins.forEach(pin => pin.visible = false);

        // Crear luces que iluminen toda la esfera
        const pointLight1 = new THREE.PointLight(0xffffff, 1, 0);
        pointLight1.position.set(50, 50, 50);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 1, 0);
        pointLight2.position.set(-50, -50, -50);
        scene.add(pointLight2);

        // Detener la animación de rotación
        autoRotate = false;

        // Incrementar el valor del radio de la segunda esfera cada 100 ms
        demoInterval = setInterval(() => {
            let currentRadius = parseFloat(radiusSlider.value);
            const halfSliderValue = (parseFloat(radiusSlider.min) + parseFloat(radiusSlider.max)) / 2;

            if (currentRadius < parseFloat(radiusSlider.max)) {
                radiusSlider.value = (currentRadius + 0.001).toFixed(3);
                const newRadius = parseFloat(radiusSlider.value);
                const newSecondSphereGeometry = new THREE.SphereGeometry(newRadius, 720, 360);
                secondSphere.geometry.dispose();
                secondSphere.geometry = newSecondSphereGeometry;

                // Verificar si se ha alcanzado la mitad del slider para mostrar el pin de Lima
                if (currentRadius >= halfSliderValue && !pins[0].visible) {
                    // Mostrar el pin de Lima
                    pins[0].visible = true;

                    // Simular el clic en el pin de Lima
                    const modal = document.getElementById('info-modal');
                    const modalContent = document.getElementById('modal-content');
                    modalContent.textContent = pins[0].userData.info;
                    modal.style.display = 'block';

                    // Esperar 2 segundos y luego cerrar el modal
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 2000);
                }

            } else {
                // Detener el incremento y salir del modo demo cuando se alcanza el valor máximo
                clearInterval(demoInterval);
                demo(false); // Salir del modo demo automáticamente
            }
        }, 100);

    } else {
        // Mostrar nuevamente los controles
        controlsContainer.style.display = 'block';

        // Detener el incremento del radio
        clearInterval(demoInterval);

        // Restaurar el valor original del slider
        radiusSlider.value = initialSliderValue;
        const newSecondSphereGeometry = new THREE.SphereGeometry(initialSliderValue, 720, 360);
        secondSphere.geometry.dispose();
        secondSphere.geometry = newSecondSphereGeometry;

        // Reactivar la rotación automática
        autoRotate = true;

        // Asegurar que el checkbox del demo esté desmarcado
        demoSwitch.checked = false;

        // Restaurar la visibilidad de todos los pines
        pins.forEach(pin => pin.visible = true);
    }
}

// Vincular el modo demo al switch HTML
const demoSwitch = document.getElementById('demo-switch');
demoSwitch.addEventListener('change', (event) => {
    demo(event.target.checked);
});

// Animación
let autoRotate = true;
let demoInterval;
const initialSliderValue = parseFloat(document.getElementById('sphere-radius').value);

function animate() {
    requestAnimationFrame(animate);

    // Actualizar todos los pines
    pins.forEach(pin => pin.update());

    if (autoRotate) {
        sphere.rotation.y += 0.0015;
        secondSphere.rotation.y += 0.002;
    }
    controls.update();
    renderer.render(scene, camera);
}


// Redimensionar ventana
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Iniciar animación
animate();

// Control del radio de la segunda esfera
const radiusSlider = document.getElementById('sphere-radius');
radiusSlider.addEventListener('input', (event) => {
    const newRadius = parseFloat(event.target.value);
    const newSecondSphereGeometry = new THREE.SphereGeometry(newRadius, 720, 360);
    secondSphere.geometry.dispose();
    secondSphere.geometry = newSecondSphereGeometry;
});

// Botón para rotación
const toggleRotationButton = document.getElementById('toggle-rotation');
toggleRotationButton.addEventListener('click', () => {
    autoRotate = !autoRotate;
    toggleRotationButton.textContent = autoRotate ? "detener giro" : "iniciar giro";
});

//Funcionalidad
function toggleCard() {
    const floatingBox = document.getElementById('floatingBox');
    floatingBox.classList.toggle('expanded');
}
