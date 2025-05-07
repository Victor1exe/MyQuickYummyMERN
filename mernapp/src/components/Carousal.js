// import React from 'react'

// export default function Carousel() {
//     return (
//         <div>

//             <div id="carouselExampleFade" className="carousel slide carousel-fade " data-bs-ride="carousel">

//                 <div className="carousel-inner " id='carousel'>
//                     <div class=" carousel-caption  " style={{ zIndex: "9" }}>
//                         <form className=" d-flex justify-content-center">  {/* justify-content-center, copy this <form> from navbar for search box */}
//                             <input className="form-control me-2 w-75 bg-white text-dark" type="search" placeholder="Type in..." aria-label="Search" />
//                             <button className="btn text-white bg-success" type="submit">Search</button>
//                         </form>
//                     </div>
//                     <div className="carousel-item active" >
//                         <img src="https://source.unsplash.com/random/1920x720/?burger" className="d-block w-100  " style={{ filter: "brightness(80%)" }} alt="..." />
//                     </div>
//                     <div className="carousel-item">
//                         <img src="https://source.unsplash.com/random/1920x720/?pizza" className="d-block w-100 " style={{ filter: "brightness(80%)" }} alt="..." />
//                     </div>
//                     <div className="carousel-item">
//                         <img src="https://source.unsplash.com/random/1920x720/?pasta" className="d-block w-100 " style={{ filter: "brightness(80%)" }} alt="..." />
//                     </div>
//                 </div>
//                 <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="prev">
//                     <span className="carousel-control-prev-icon" aria-hidden="true"></span>
//                     <span className="visually-hidden">Previous</span>
//                 </button>
//                 <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="next">
//                     <span className="carousel-control-next-icon" aria-hidden="true"></span>
//                     <span className="visually-hidden">Next</span>
//                 </button>
//             </div>


//         </div>
//     )
// }


import React, { useState, useEffect } from 'react';

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      img: "https://source.unsplash.com/random/1920x720/?burger",
      alt: "Burger"
    },
    {
      img: "https://source.unsplash.com/random/1920x720/?pizza",
      alt: "Pizza"
    },
    {
      img: "https://source.unsplash.com/random/1920x720/?pasta",
      alt: "Pasta"
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div>
      <div id="carouselExampleFade" className="carousel slide carousel-fade" style={{ position: 'relative' }}>
        <div className="carousel-inner" id='carousel'>
          <div className="carousel-caption" style={{ zIndex: "9" }}>
            <form className="d-flex justify-content-center">
              <input 
                className="form-control me-2 w-75 bg-white text-dark" 
                type="search" 
                placeholder="Type in..." 
                aria-label="Search" 
              />
              <button className="btn text-white bg-success" type="submit">Search</button>
            </form>
          </div>
          
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
              style={{
                display: index === currentSlide ? 'block' : 'none',
                transition: 'opacity 0.6s ease'
              }}
            >
              <img 
                src={slide.img} 
                className="d-block w-100" 
                style={{ filter: "brightness(80%)" }} 
                alt={slide.alt}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://source.unsplash.com/random/1920x720/?${slide.alt}`;
                }}
              />
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-control-prev" 
          type="button" 
          onClick={goToPrev}
          style={{ cursor: 'pointer' }}
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        
        <button 
          className="carousel-control-next" 
          type="button" 
          onClick={goToNext}
          style={{ cursor: 'pointer' }}
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <style jsx>{`
        .carousel {
          position: relative;
          max-height: 720px;
          overflow: hidden;
        }
        .carousel-item {
          transition: opacity 0.6s ease;
        }
        .carousel-caption {
          position: absolute;
          bottom: 50%;
          left: 50%;
          transform: translate(-50%, 50%);
          z-index: 10;
          width: 100%;
        }
        .carousel-control-prev, .carousel-control-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
          width: auto;
          opacity: 0.5;
          transition: opacity 0.15s ease;
        }
        .carousel-control-prev {
          left: 0;
        }
        .carousel-control-next {
          right: 0;
        }
        .carousel-control-prev:hover, .carousel-control-next:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  )
}