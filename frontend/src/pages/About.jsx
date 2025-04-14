import { assets } from '../assets/assets'

const About = () => {
  // Create an array of team members with different images from assets
  const teamMembers = [
    { id: 1, name: "Dr. Sarah Johnson", position: "Chief Medical Officer", image: assets.member2 || assets.member },
    { id: 2, name: "Dr. Michael Chen", position: "Medical Director", image: assets.member3 || assets.member },
    { id: 3, name: "Dr. Jessica Patel", position: "Head of Patient Care", image: assets.member4 || assets.member },
    { id: 4, name: "Dr. Robert Wilson", position: "Technology Lead", image: assets.member2|| assets.member }
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="relative inline-block">
          <span className="text-4xl font-light text-gray-500">ABOUT</span>
          <span className="text-4xl font-bold text-gray-800 ml-2">US</span>
          <div className="absolute -bottom-3 left-0 right-0 h-1 bg-primary rounded-full"></div>
        </h1>
        <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
          Transforming healthcare access through technology and compassion
        </p>
      </div>

      {/* About Content Section */}
      <div className="my-16 flex flex-col md:flex-row gap-12 items-center">
        <div className="md:w-1/2 relative">
          <div className="bg-primary/10 absolute -top-4 -left-4 w-full h-full rounded-lg"></div>
          <img 
            className="w-full rounded-lg shadow-lg relative z-10" 
            src={assets.about_image} 
            alt="Healthcare professionals" 
          />
          <div className="hidden md:block absolute -bottom-6 -right-6 bg-primary/80 text-white p-6 rounded-lg shadow-lg z-20">
            <p className="text-xl font-semibold">Since 2020</p>
            <p className="text-sm">Serving over 10,000+ patients</p>
          </div>
        </div>
        
        <div className="md:w-1/2 flex flex-col justify-center gap-6 text-gray-600">
          <h2 className="text-2xl font-semibold text-gray-800">Your Trusted Healthcare Partner</h2>
          
          <p className="leading-relaxed">
            Welcome to MediCure, your trusted partner in managing your healthcare needs conveniently and efficiently. At MediCure, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
          </p>
          
          <p className="leading-relaxed">
            MediCure is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you are booking your first appointment or managing ongoing care, MediCure is here to support you every step of the way.
          </p>
          
          <div className="p-4 bg-primary/5 border-l-4 border-primary rounded">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Vision</h3>
            <p className="italic">
              Our vision at MediCure is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="my-20 bg-gray-50 p-8 rounded-lg">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="md:w-1/3">
            <img 
              className="rounded-full mx-auto shadow-lg" 
              src={assets.hands} 
              alt="Our mission" 
            />
          </div>
          <div className="md:w-2/3">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At MediCure, our mission is to democratize access to quality healthcare services through innovative technology solutions. We believe that everyone deserves convenient, personalized healthcare management tools that empower them to take control of their wellbeing.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Through our platform, we strive to reduce the administrative burden on both patients and healthcare providers, allowing for more meaningful interactions and better health outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="my-20">
        <h2 className="text-3xl font-light text-center mb-12">
          WHY <span className="font-bold text-gray-800">CHOOSE US</span>
          <div className="h-1 w-24 bg-primary mx-auto mt-3 rounded-full"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              <img 
                src={assets.efficiency} 
                alt="Efficiency" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-8 hover:bg-primary group transition-colors duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white">EFFICIENCY</h3>
              <p className="text-gray-600 group-hover:text-white">
                Streamlined appointment scheduling that fits into your busy lifestyle. Our intelligent system minimizes wait times and optimizes your healthcare journey.
              </p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              <img 
                src={assets.convinience}  
                alt="Convenience" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-8 hover:bg-primary group transition-colors duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white">CONVENIENCE</h3>
              <p className="text-gray-600 group-hover:text-white">
                Access to a network of trusted healthcare professionals in your area. Book appointments, receive reminders, and manage prescriptions all in one place.
              </p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
              <img 
               src={assets.personalization} 
                alt="Personalization" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-8 hover:bg-primary group transition-colors duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white">PERSONALIZATION</h3>
              <p className="text-gray-600 group-hover:text-white">
                Tailored recommendations and reminders to help you stay on top of your health. Our system learns your preferences to provide a customized healthcare experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="my-20">
        <h2 className="text-3xl font-light text-center mb-12">
          OUR <span className="font-bold text-gray-800">TEAM</span>
          <div className="h-1 w-24 bg-primary mx-auto mt-3 rounded-full"></div>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="text-center">
              <div className="relative inline-block rounded-full overflow-hidden mb-4 border-4 border-primary/20">
                <img 
                  src={member.image} 
                  alt={`${member.name}`} 
                  className="w-48 h-48 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
              <p className="text-primary">{member.position}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default About