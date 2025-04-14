import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
    return (
        <div id='speciality' className='flex flex-col items-center gap-6 py-16 px-4 bg-gradient-to-b from-white to-gray-50'>
            {/* Header Section */}
            <div className='text-center max-w-2xl'>
                <h1 className='text-4xl font-bold text-gray-800 mb-3'>Find by Speciality</h1>
                <p className='text-gray-600 text-lg'>Browse our network of trusted specialists and book appointments with ease</p>
            </div>

            {/* Speciality Cards */}
            <div className='flex justify-start sm:justify-center gap-6 pt-8 w-full overflow-x-auto pb-4 scrollbar-hide'>
                {specialityData.map((item, index) => (
                    <Link 
                        to={`/doctors/${item.speciality}`} 
                        onClick={() => window.scrollTo(0, 0)} 
                        className='flex flex-col items-center group cursor-pointer flex-shrink-0 transition-all duration-300 hover:scale-105' 
                        key={index}
                    >
                        <div className='w-20 h-20 sm:w-28 sm:h-28 mb-3 bg-white rounded-full shadow-md flex items-center justify-center group-hover:shadow-lg group-hover:bg-blue-50 transition-all duration-300 p-4'>
                            <img 
                                className='w-full h-full object-contain' 
                                src={item.image} 
                                alt={item.speciality} 
                            />
                        </div>
                        <p className='text-sm sm:text-base font-medium text-gray-700 group-hover:text-blue-600 transition-colors'>{item.speciality}</p>
                    </Link>
                ))}
            </div>

            {/* View All Button */}
            <button className='mt-8 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg'>
                View All Specialities
            </button>
        </div>
    )
}

export default SpecialityMenu