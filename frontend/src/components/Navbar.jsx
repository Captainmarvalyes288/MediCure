import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {

  const navigate = useNavigate()

  const [showMenu, setShowMenu] = useState(false)
  const { token, setToken, userData } = useContext(AppContext)

  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    navigate('/login')
  }

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD]'>
      <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="" />
      <ul className='md:flex items-start gap-5 font-medium hidden'>
        <NavLink to='/' >
          <li className='py-1'>HOME</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/doctors' >
          <li className='py-1'>ALL DOCTORS</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/medicines' >
          <li className='py-1'>MEDICINES</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/about' >
          <li className='py-1'>ABOUT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/contact' >
          <li className='py-1'>CONTACT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
      </ul>

      <div className='flex items-center gap-4 '>
        {
          token && userData
            ? <div className="flex items-center gap-3 cursor-pointer group relative">
                {/* User Avatar */}
                <div className="relative">
                  <img 
                    className="w-10 h-10 rounded-full border-2 border-transparent
                              group-hover:border-primary transition-all duration-300
                              object-cover shadow-md"
                    src={userData.image} 
                    alt="User Profile" 
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                                  rounded-full border-2 border-white"></div>
                </div>

                {/* Dropdown Icon */}
                <img 
                  className="w-3 transition-transform duration-300
                            group-hover:rotate-180" 
                  src={assets.dropdown_icon} 
                  alt="Toggle Menu" 
                />

                {/* Dropdown Menu */}
                <div className="absolute top-0 right-0 pt-14 min-w-[200px] z-30
                                opacity-0 invisible group-hover:opacity-100 
                                group-hover:visible transition-all duration-300">
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100
                                  overflow-hidden transform origin-top-right 
                                  transition-all duration-300 scale-95 
                                  group-hover:scale-100">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="font-medium text-gray-800">{userData.name}</p>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button 
                        onClick={() => navigate('/my-profile')} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm
                                  text-gray-600 hover:text-primary hover:bg-primary/5
                                  rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M20 22a8 8 0 10-16 0" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        My Profile
                      </button>

                      <button 
                        onClick={() => navigate('/my-appointments')} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm
                                  text-gray-600 hover:text-primary hover:bg-primary/5
                                  rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        My Appointments
                      </button>

                      <button 
                        onClick={logout} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm
                                  text-red-600 hover:text-red-700 hover:bg-red-50
                                  rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                                stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            : <button onClick={() => navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>Create account</button>
        }
        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />

        {/* ---- Mobile Menu ---- */}
        <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img src={assets.logo} className='w-36' alt="" />
            <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-7' alt="" />
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded full inline-block'>HOME</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors' ><p className='px-4 py-2 rounded full inline-block'>ALL DOCTORS</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/medicines' ><p className='px-4 py-2 rounded full inline-block'>MEDICINES</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about' ><p className='px-4 py-2 rounded full inline-block'>ABOUT</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact' ><p className='px-4 py-2 rounded full inline-block'>CONTACT</p></NavLink>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar