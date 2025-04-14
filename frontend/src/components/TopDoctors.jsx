import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)
    const [isVisible, setIsVisible] = useState(false)
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const [activeFilter, setActiveFilter] = useState('All')

    // Animation on mount
    useEffect(() => {
        setIsVisible(true)
    }, [])

    // Define speciality filters based on available doctors
    const specialities = ['All', ...new Set(doctors.map(doc => doc.speciality).slice(0, 7))]

    // Filter doctors based on active filter
    const filteredDoctors = activeFilter === 'All' 
        ? doctors.slice(0, 5)
        : doctors.filter(doc => doc.speciality === activeFilter).slice(0, 5)

    // Add keyframes for animations
    const animationKeyframes = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
    `;

    return (
        <>
            <style>{animationKeyframes}</style>
            <div className='flex flex-col items-center gap-6 py-16 px-4 sm:px-8 relative overflow-hidden'>
                {/* Colorful Background */}
                <div 
                    className='absolute inset-0 -z-10' 
                    style={{
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                    }}
                >
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40">
                        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-blue-300 mix-blend-multiply blur-3xl"></div>
                        <div className="absolute top-40 right-20 w-72 h-72 rounded-full bg-indigo-300 mix-blend-multiply blur-3xl"></div>
                        <div className="absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-purple-300 mix-blend-multiply blur-3xl"></div>
                    </div>
                </div>

                {/* Header Section with Animation */}
                <div className={`text-center max-w-3xl transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className='text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent mb-3'>
                        Our Top Specialists
                    </h1>
                    <p className='text-gray-700 text-lg'>
                        Book appointments with our most trusted healthcare professionals
                    </p>
                    <div className="w-24 h-1 mx-auto mt-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>

                {/* Speciality Filters */}
                <div className={`flex flex-wrap justify-center gap-3 my-4 transition-all duration-1000 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {specialities.map((speciality, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveFilter(speciality)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeFilter === speciality 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {speciality}
                        </button>
                    ))}
                </div>

                {/* Doctors Grid with Staggered Animation */}
                <div className='w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-6'>
                    {filteredDoctors.map((item, index) => (
                        <div 
                            onClick={() => { 
                                navigate(`/appointment/${item._id}`); 
                                window.scrollTo(0, 0) 
                            }} 
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl group border border-gray-100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                            style={{ 
                                transitionDelay: `${index * 100}ms`,
                                transform: hoveredIndex === index ? 'translateY(-10px) scale(1.03)' : 'translateY(0) scale(1)'
                            }}
                            key={index}
                        >
                            {/* Doctor Image with Colorful Overlay */}
                            <div className='h-48 overflow-hidden relative'>
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-purple-600/10 group-hover:opacity-70 opacity-30 transition-opacity z-10"></div>
                                <img 
                                    className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110' 
                                    src={item.image} 
                                    alt={item.name} 
                                />
                                
                                {/* Availability Badge with Animation */}
                                <div 
                                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium z-20 transition-all duration-300 ${
                                        item.available 
                                            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg' 
                                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                                    } ${hoveredIndex === index ? 'scale-110' : ''}`}
                                    style={{
                                        boxShadow: item.available ? '0 0 15px rgba(16, 185, 129, 0.5)' : 'none'
                                    }}
                                >
                                    {item.available ? 'Available Today' : 'Booked Out'}
                                </div>
                                
                                {/* Quick Book Button (Shows on Hover) */}
                                <div 
                                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/90 to-blue-900/0 p-3 transform transition-all duration-300 ${
                                        hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                                    }`}
                                >
                                    <button className="w-full py-1.5 bg-white text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors">
                                        Quick Book
                                    </button>
                                </div>
                            </div>
                            
                            {/* Doctor Info with Enhanced Styling */}
                            <div className='p-5'>
                                <h3 className='text-xl font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors'>{item.name}</h3>
                                <p className='text-blue-600 font-medium mb-3'>
                                    <span className="inline-block mr-2">
                                        <svg className="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                        </svg>
                                    </span>
                                    {item.speciality}
                                </p>
                                
                                {/* Rating with Animation */}
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div className='flex items-center'>
                                            {[...Array(5)].map((_, i) => (
                                                <svg 
                                                    key={i}
                                                    className={`w-4 h-4 transition-all duration-300 ${
                                                        i < item.rating 
                                                            ? 'text-yellow-400 group-hover:scale-110' 
                                                            : 'text-gray-300'
                                                    }`}
                                                    style={{ transitionDelay: `${i * 50}ms` }}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className='text-sm text-gray-500'>({item.reviews || 24})</span>
                                    </div>
                                    
                                    {/* Fee Indicator */}
                                    <span className="text-sm font-semibold text-gray-700 bg-blue-50 px-2 py-1 rounded">
                                        ${(item.fee || 60 + index * 5)}/hr
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Check if no doctors are available after filtering */}
                {filteredDoctors.length === 0 && (
                    <div className="text-center p-8 rounded-lg bg-white bg-opacity-80 shadow-sm border border-gray-100">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No doctors found</h3>
                        <p className="mt-2 text-gray-600">We couldn't find any doctors matching your filter criteria.</p>
                        <button 
                            onClick={() => setActiveFilter('All')} 
                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            View all doctors
                        </button>
                    </div>
                )}

                {/* View More Button with Animation */}
                <button 
                    onClick={() => { 
                        navigate('/doctors'); 
                        window.scrollTo(0, 0) 
                    }} 
                    className={`relative overflow-hidden group px-8 py-3 rounded-full mt-6 font-medium text-white transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ 
                        transitionDelay: '800ms',
                        background: 'linear-gradient(45deg, #4f46e5, #3b82f6, #0ea5e9)', 
                        backgroundSize: '200% 200%',
                        animation: 'shimmer 3s infinite linear'
                    }}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        View All Doctors
                        <svg className="w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                    </span>
                    <span className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-20 bg-white transition-opacity"></span>
                </button>
            </div>
        </>
    )
}

export default TopDoctors