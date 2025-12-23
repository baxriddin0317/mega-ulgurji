import { Mail, MapPin, Phone } from 'lucide-react'
import { PiTelegramLogo } from "react-icons/pi";
import React from 'react'
import { FaInstagram } from 'react-icons/fa';

const LocationSection = ({ forceColor = false }: { forceColor?: boolean }) => {
  return (
    <section id="location" className={`${forceColor ? 'bg-black' : ''} py-16 mt-20 md:mt-32 lg:mt-44`}>
      <div className="container mx-auto px-4">
        <div data-aos="fade-up" className="text-center mb-12">
          <h2 className="text-[#d1d1d1] text-3xl font-bold mb-4">Bizning manzil</h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Bizning do&apos;konimizga tashrif buyuring va mahsulotlarimizni o&apos;z ko&apos;zingiz bilan ko&apos;ring.
          </p>
        </div>
        
        <div data-aos="fade-up" className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-transparent p-6">
            <h3 className="text-[#d1d1d1] text-xl font-bold mb-4">Aloqa ma&apos;lumotlari</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="text-primary mt-1 mr-4">
                  <MapPin className="text-[#d1d1d1] h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[#d1d1d1] font-medium">Manzil:</h4>
                  <p className="text-white/80">
                    Andijon shahar, Boburshox ko&apos;chasi, 26 uy
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-primary mt-1 mr-4">
                  <Phone className="text-[#d1d1d1] h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[#d1d1d1] font-medium">Telefon:</h4>
                  <p className="text-white/80">+998 88 003 9000</p>
                  <p className="text-white/80">+998 99 003 9000</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-primary mt-1 mr-4">
                  <PiTelegramLogo className="text-[#d1d1d1] h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[#d1d1d1] font-medium">Telegram:</h4>
                  <a href='https://t.me/megahomeuz' target='_blank' className="text-white/80">Mega Home uz</a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-primary mt-1 mr-4">
                  <Mail className="text-[#d1d1d1] h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[#d1d1d1] font-medium">Email:</h4>
                  <a href='mailto:Megahomeweb@gmail.com' className="text-white/80">Megahomeweb@gmail.com</a>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-primary mt-1 mr-4">
                  <FaInstagram className="text-[#d1d1d1] h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[#d1d1d1] font-medium">Instagram:</h4>
                  <a href='https://www.instagram.com/megahome.ulgurji?igsh=a3c1N2ttbTl0NGJz' target='_blank' className="text-white/80 capitalize">bizning sahifamizga kiring</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg overflow-hidden h-80">
            {/* Map display */}
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <iframe
                className="size-full"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1665.0809943093248!2d72.35475205284405!3d40.757938844846535!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bced6b92db4ad7%3A0x49234e89ae2c8833!2sMEGA%20HOME!5e0!3m2!1sen!2sus!4v1707729952035!5m2!1sen!2sus"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LocationSection