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
    <div className='w-full bg-white shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div 
            onClick={() => navigate('/')} 
            className='flex-shrink-0 cursor-pointer transition-transform hover:scale-105'
          >
            <img className='h-10 w-auto' src={assets.logo} alt="Logo" />
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:block'>
            <div className='ml-10 flex items-center space-x-8'>
              <NavLink 
                to='/' 
                className={({ isActive }) => 
                  `text-gray-900 hover:text-primary px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'border-b-2 border-primary' : ''
                  }`
                }
              >
                HOME
              </NavLink>
              
              <NavLink 
                to='/doctors' 
                className={({ isActive }) => 
                  `text-gray-900 hover:text-primary px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'border-b-2 border-primary' : ''
                  }`
                }
              >
                ALL DOCTORS
              </NavLink>
              
              {token && (
                <>
                  <NavLink 
                    to='/medicines' 
                    className={({ isActive }) => 
                      `text-gray-900 hover:text-primary px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                        isActive ? 'border-b-2 border-primary' : ''
                      }`
                    }
                  >
                    PRESCRIPTION
                  </NavLink>
                  
                  <NavLink 
                    to='/all-medicines' 
                    className={({ isActive }) => 
                      `text-gray-900 hover:text-primary px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                        isActive ? 'border-b-2 border-primary' : ''
                      }`
                    }
                  >
                    MEDICINES
                  </NavLink>
                  
                  <NavLink 
                    to='/all-labs' 
                    className={({ isActive }) => 
                      `text-gray-900 hover:text-primary px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                        isActive ? 'border-b-2 border-primary' : ''
                      }`
                    }
                  >
                    LABS
                  </NavLink>
                </>
              )}
              
              <NavLink 
                to='/about' 
                className={({ isActive }) => 
                  `text-gray-900 hover:text-primary px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'border-b-2 border-primary' : ''
                  }`
                }
              >
                ABOUT
              </NavLink>
              
              <NavLink 
                to='/contact' 
                className={({ isActive }) => 
                  `text-gray-900 hover:text-primary px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'border-b-2 border-primary' : ''
                  }`
                }
              >
                CONTACT
              </NavLink>
            </div>
          </div>

          {/* Right side buttons */}
          <div className='flex items-center gap-4'>
            {token && userData ? (
              <div className="flex items-center gap-3 cursor-pointer group relative">
                {/* User Avatar - Keep existing styling */}
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
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className='hidden md:inline-flex items-center px-4 py-2 border border-transparent 
                          text-sm font-medium rounded-md shadow-sm text-white bg-primary 
                          hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 
                          focus:ring-primary-light transition-colors duration-200'
              >
                Create account
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMenu(true)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md 
                        text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none 
                        focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
            >
              <img className='w-6 h-6' src={assets.menu_icon} alt="Menu" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed inset-0 z-50 overflow-y-auto bg-white transition-all 
                  duration-300 transform ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <img src={assets.logo} className='h-8 w-auto' alt="Logo" />
          <button
            onClick={() => setShowMenu(false)}
            className="p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <img className='w-6 h-6' src={assets.cross_icon} alt="Close" />
          </button>
        </div>
        
        <div className='px-6 py-4'>
          <nav className='grid gap-6'>
            <NavLink
              onClick={() => setShowMenu(false)}
              to='/'
              className='text-gray-900 hover:text-primary px-3 py-2 rounded-md text-base font-medium'
            >
              HOME
            </NavLink>
            
            <NavLink
              onClick={() => setShowMenu(false)}
              to='/doctors'
              className='text-gray-900 hover:text-primary px-3 py-2 rounded-md text-base font-medium'
            >
              ALL DOCTORS
            </NavLink>
            
            {token && (
              <>
                <NavLink
                  onClick={() => setShowMenu(false)}
                  to='/medicines'
                  className='text-gray-900 hover:text-primary px-3 py-2 rounded-md text-base font-medium'
                >
                  PRESCRIPTION
                </NavLink>
                
                <NavLink
                  onClick={() => setShowMenu(false)}
                  to='/all-medicines'
                  className='text-gray-900 hover:text-primary px-3 py-2 rounded-md text-base font-medium'
                >
                  MEDICINES
                </NavLink>
                
                <NavLink
                  onClick={() => setShowMenu(false)}
                  to='/all-labs'
                  className='text-gray-900 hover:text-primary px-3 py-2 rounded-md text-base font-medium'
                >
                  LABS
                </NavLink>
              </>
            )}
            
            <NavLink
              onClick={() => setShowMenu(false)}
              to='/about'
              className='text-gray-900 hover:text-primary px-3 py-2 rounded-md text-base font-medium'
            >
              ABOUT
            </NavLink>
            
            <NavLink
              onClick={() => setShowMenu(false)}
              to='/contact'
              className='text-gray-900 hover:text-primary px-3 py-2 rounded-md text-base font-medium'
            >
              CONTACT
            </NavLink>
            
            {!token && (
              <button
                onClick={() => {
                  setShowMenu(false)
                  navigate('/login')
                }}
                className='w-full mt-4 inline-flex justify-center items-center px-4 py-2 border border-transparent 
                          text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark 
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light'
              >
                Create account
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Navbar