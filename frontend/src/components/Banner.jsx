import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Banner = () => {
    const navigate = useNavigate()
    const [isHovering, setIsHovering] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    
    // Animation on mount
    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <div 
            className={`flex bg-primary rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 shadow-lg transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
            {/* ------- Left Side ------- */}
            <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
                <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white transform transition-all duration-500'>
                    <p className={`transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`} style={{ transitionDelay: '300ms' }}>
                        Book Appointment
                    </p>
                    <p className={`mt-4 transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`} style={{ transitionDelay: '600ms' }}>
                        With <span className="relative">
                            <span className="relative z-10">100+ Trusted Doctors</span>
                            <span className="absolute -bottom-2 left-0 w-full h-2 bg-white/20 rounded-full -z-0"></span>
                        </span>
                    </p>
                </div>
                
                <button 
                    onClick={() => { navigate('/login'); scrollTo(0, 0) }} 
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className={`bg-white text-sm sm:text-base text-[#595959] px-8 py-3 rounded-full mt-8 relative overflow-hidden group transform transition-all duration-300 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: '900ms' }}
                >
                    <span className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 transform transition-transform duration-500 ${isHovering ? 'translate-x-0' : '-translate-x-full'}`}></span>
                    <span className="relative flex items-center justify-center gap-2">
                        Create account
                        <svg className={`w-4 h-4 transform transition-transform duration-300 ${isHovering ? 'translate-x-1' : 'translate-x-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </span>
                </button>
                
                <div className={`mt-6 text-white/80 text-sm flex items-center gap-2 transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '1200ms' }}>
                    <span className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white/90 border-2 border-primary flex items-center justify-center text-primary text-xs font-bold">
                                {i}
                            </div>
                        ))}
                    </span>
                    <span>Join thousands of satisfied patients</span>
                </div>
            </div>
            
            {/* ------- Right Side ------- */}
            <div className='hidden md:block md:w-1/2 lg:w-[370px] relative'>
                <div className={`absolute -top-10 right-10 w-20 h-20 rounded-full bg-white/20 transform transition-all duration-700 ${isVisible ? 'scale-100 opacity-70' : 'scale-0 opacity-0'}`} style={{ transitionDelay: '400ms' }}></div>
                <div className={`absolute top-20 right-5 w-12 h-12 rounded-full bg-white/30 transform transition-all duration-700 ${isVisible ? 'scale-100 opacity-70' : 'scale-0 opacity-0'}`} style={{ transitionDelay: '600ms' }}></div>
                
                <img 
                    className={`w-full absolute bottom-0 right-0 max-w-md transform transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`} 
                    style={{ transitionDelay: '300ms' }}
                    src={assets.appointment_img} 
                    alt="Doctor illustration" 
                />
                
                <div className={`absolute top-1/4 right-1/2 bg-white rounded-lg p-3 shadow-lg transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '800ms' }}>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs font-medium">100+ Online</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banner