import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)
    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

    // Function to update user profile data using API
    const updateUserProfileData = async () => {
        try {
            const formData = new FormData();
            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)

            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    if (!userData) return null;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header with background */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
                <div className="absolute -bottom-16 left-8">
                    {isEdit ? (
                        <label htmlFor="image" className="cursor-pointer block">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg relative overflow-hidden">
                                <img 
                                    className="h-full w-full object-cover" 
                                    src={image ? URL.createObjectURL(image) : userData.image} 
                                    alt="Profile" 
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <img className="w-10 h-10" src={assets.upload_icon} alt="Upload" />
                                </div>
                            </div>
                            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" className="hidden" />
                        </label>
                    ) : (
                        <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                            <img 
                                className="h-full w-full object-cover" 
                                src={userData.image} 
                                alt="Profile" 
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Content section */}
            <div className="pt-20 px-8 pb-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex-1">
                        {isEdit ? (
                            <input 
                                className="text-3xl font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500" 
                                type="text" 
                                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                                value={userData.name} 
                            />
                        ) : (
                            <h1 className="text-3xl font-bold text-gray-800">{userData.name}</h1>
                        )}
                    </div>
                    <div>
                        {isEdit ? (
                            <button 
                                onClick={updateUserProfileData} 
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Save Profile
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsEdit(true)} 
                                className="px-6 py-2.5 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Information
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-gray-500">Email Address</p>
                                <p className="text-blue-600 font-medium">{userData.email}</p>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-gray-500">Phone Number</p>
                                {isEdit ? (
                                    <input 
                                        className="bg-white border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500" 
                                        type="text" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                                        value={userData.phone} 
                                    />
                                ) : (
                                    <p className="text-blue-600 font-medium">{userData.phone}</p>
                                )}
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-gray-500">Address</p>
                                {isEdit ? (
                                    <div className="space-y-2">
                                        <input 
                                            className="bg-white border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500" 
                                            type="text" 
                                            placeholder="Address Line 1"
                                            onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                                            value={userData.address.line1} 
                                        />
                                        <input 
                                            className="bg-white border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500" 
                                            type="text" 
                                            placeholder="Address Line 2"
                                            onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                                            value={userData.address.line2} 
                                        />
                                    </div>
                                ) : (
                                    <p className="text-gray-700">
                                        {userData.address.line1}<br />
                                        {userData.address.line2}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Basic Information */}
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Basic Information
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-gray-500">Gender</p>
                                {isEdit ? (
                                    <select 
                                        className="bg-white border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                                        value={userData.gender}
                                    >
                                        <option value="Not Selected">Not Selected</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-700">{userData.gender}</p>
                                )}
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-gray-500">Date of Birth</p>
                                {isEdit ? (
                                    <input 
                                        className="bg-white border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500" 
                                        type="date" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                                        value={userData.dob} 
                                    />
                                ) : (
                                    <p className="text-gray-700">{userData.dob}</p>
                                )}
                            </div>
                            
                            {/* Additional space for potential future fields */}
                            <div className="h-12"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyProfile