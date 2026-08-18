// Decoración de fondo: copias de dos imágenes flotando de a poco, detrás de
// todo el contenido (position:fixed + z-index negativo, pointer-events:none
// para que nunca interfieran con clicks/foco). Ambas ya vienen con el fondo
// recortado (chroma key / transparencia real) — sin eso se veía el
// rectángulo de color original detrás de la figura.
const FIGURES = [
  { src: '/yisus-transparent.gif', top: '4%', left: '3%', size: 78, rotate: -8, delay: 0, duration: 7.2 },
  { src: '/mister-x-transparent.png', top: '16%', left: '86%', size: 58, rotate: 7, delay: 1.1, duration: 6.4 },
  { src: '/yisus-transparent.gif', top: '46%', left: '1%', size: 54, rotate: 5, delay: 0.6, duration: 8.1 },
  { src: '/mister-x-transparent.png', top: '62%', left: '90%', size: 68, rotate: -5, delay: 1.8, duration: 6.8 },
  { src: '/yisus-transparent.gif', top: '80%', left: '8%', size: 48, rotate: 10, delay: 0.4, duration: 7.4 },
  { src: '/mister-x-transparent.png', top: '86%', left: '66%', size: 60, rotate: -11, delay: 2.6, duration: 6.6 },
];

export default function BackgroundFigures() {
  return (
    <div className="bg-figures" aria-hidden="true">
      {FIGURES.map((f, i) => (
        <div
          key={i}
          className="bg-figure"
          style={{
            top: f.top, left: f.left, width: f.size,
            '--rotate': f.rotate + 'deg',
            animationDelay: f.delay + 's',
            animationDuration: f.duration + 's'
          }}
        >
          <img src={f.src} alt="" />
        </div>
      ))}
    </div>
  );
}
