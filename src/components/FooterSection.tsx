import { memo } from 'react';

function FooterSection() {
  return (
    <div 
      className="footer-wrap relative z-20"
      style={{
        willChange: 'transform',
        transform: 'translate3d(0px, -30%, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)',
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="cloud-wrap relative">
        <div className="footer-panel py-16 lg:py-20">
          <div className="padding-global">
            <div className="container-xlarge">
              <div className="footer-grid grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                
                {/* Newsletter Section */}
                <div className="footer-cell">
                  <div className="menu-cell-inner left">
                    <div className="newsletter-panel">
                      <div className="heading-wrapper newsletter">
                        <div className="padding-bottom padding-small">
                          <h3 className="newsletter-heading text-xl lg:text-2xl text-white mb-4">
                            Stay up to date with all things Things
                          </h3>
                        </div>
                        <p className="footer-form-description text-white/70 mb-6 text-sm lg:text-base">
                          Join our mailing list to be the first to know about new features and releases.
                        </p>
                      </div>
                      
                      <div className="newsletter-input">
                        <div className="sign-up-form-block w-form">
                          <form 
                            id="wf-form-Sign-up-form" 
                            name="wf-form-Sign-up-form" 
                            className="sign-up-form flex flex-col sm:flex-row gap-3"
                          >
                            <input 
                              className="sign-up-input w-input flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/60 text-sm lg:text-base"
                              maxLength={256}
                              name="Email"
                              placeholder="things@things.stuff" 
                              type="email" 
                              id="Email-4"
                              required
                            />
                            <div className="submit-btn-wrap">
                              <input 
                                type="submit" 
                                className="submit-button footer-submit background-pink-gradient w-button px-6 py-3 rounded-full font-medium cursor-pointer text-sm lg:text-base whitespace-nowrap text-black" 
                                value="Sign up"
                              />
                            </div>
                          </form>
                          <div className="success-message w-form-done hidden">
                            <div className="form-submission-text text-white">Thank you for signing up!</div>
                          </div>
                          <div className="error-message w-form-fail hidden">
                            <div className="form-submission-text text-white">Oops! Something went wrong while submitting the form. Please try again.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="footer-cell middle">
                  <div className="menu-cell-inner link-container is-footer flex flex-col lg:flex-row gap-8">
                    {/* First Column of Links */}
                    <div className="space-y-4 flex-1">
                      <a href="/" className="page-link-button w-inline-block text-white/80 hover:text-white transition-colors duration-300 flex items-center justify-between group">
                        <div className="footer-link-text">Home</div>
                        <svg viewBox="0 0 17 12" fill="none" className="mobile-horizon-arrow w-4 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <path d="M13.2404 4.92144L10.1346 1.84756C9.91667 1.63185 9.81223 1.38019 9.82132 1.09257C9.8304 0.804959 9.93483 0.553297 10.1346 0.337586C10.3526 0.121875 10.6114 0.00952527 10.9111 0.00053734C11.2107 -0.00845059 11.4696 0.0949107 11.6875 0.310622L16.6731 5.24501C16.891 5.46072 17 5.71238 17 6C17 6.28761 16.891 6.53928 16.6731 6.75499L11.6875 11.6894C11.4696 11.9051 11.2107 12.0084 10.9111 11.9995C10.6114 11.9905 10.3526 11.8781 10.1346 11.6624C9.93483 11.4467 9.8304 11.195 9.82131 10.9074C9.81223 10.6198 9.91667 10.3681 10.1346 10.1524L13.2404 7.07855L1.08975 7.07855C0.780985 7.07855 0.522171 6.97519 0.313303 6.76847C0.104436 6.56174 2.40517e-06 6.30559 2.43189e-06 6C2.4586e-06 5.69441 0.104436 5.43825 0.313304 5.23153C0.522171 5.0248 0.780985 4.92144 1.08975 4.92144L13.2404 4.92144Z" fill="currentColor"/>
                        </svg>
                      </a>
                      
                      <a href="/about-us" className="page-link-button w-inline-block text-white/80 hover:text-white transition-colors duration-300 flex items-center justify-between group">
                        <div className="footer-link-text">About us</div>
                        <svg viewBox="0 0 17 12" fill="none" className="mobile-horizon-arrow w-4 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <path d="M13.2404 4.92144L10.1346 1.84756C9.91667 1.63185 9.81223 1.38019 9.82132 1.09257C9.8304 0.804959 9.93483 0.553297 10.1346 0.337586C10.3526 0.121875 10.6114 0.00952527 10.9111 0.00053734C11.2107 -0.00845059 11.4696 0.0949107 11.6875 0.310622L16.6731 5.24501C16.891 5.46072 17 5.71238 17 6C17 6.28761 16.891 6.53928 16.6731 6.75499L11.6875 11.6894C11.4696 11.9051 11.2107 12.0084 10.9111 11.9995C10.6114 11.9905 10.3526 11.8781 10.1346 11.6624C9.93483 11.4467 9.8304 11.195 9.82131 10.9074C9.81223 10.6198 9.91667 10.3681 10.1346 10.1524L13.2404 7.07855L1.08975 7.07855C0.780985 7.07855 0.522171 6.97519 0.313303 6.76847C0.104436 6.56174 2.40517e-06 6.30559 2.43189e-06 6C2.4586e-06 5.69441 0.104436 5.43825 0.313304 5.23153C0.522171 5.0248 0.780985 4.92144 1.08975 4.92144L13.2404 4.92144Z" fill="currentColor"/>
                        </svg>
                      </a>
                      
                      <a href="/log-book" className="page-link-button w-inline-block text-white/80 hover:text-white transition-colors duration-300 flex items-center justify-between group">
                        <div className="footer-link-text">Log book</div>
                        <svg viewBox="0 0 17 12" fill="none" className="mobile-horizon-arrow w-4 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <path d="M13.2404 4.92144L10.1346 1.84756C9.91667 1.63185 9.81223 1.38019 9.82132 1.09257C9.8304 0.804959 9.93483 0.553297 10.1346 0.337586C10.3526 0.121875 10.6114 0.00952527 10.9111 0.00053734C11.2107 -0.00845059 11.4696 0.0949107 11.6875 0.310622L16.6731 5.24501C16.891 5.46072 17 5.71238 17 6C17 6.28761 16.891 6.53928 16.6731 6.75499L11.6875 11.6894C11.4696 11.9051 11.2107 12.0084 10.9111 11.9995C10.6114 11.9905 10.3526 11.8781 10.1346 11.6624C9.93483 11.4467 9.8304 11.195 9.82131 10.9074C9.81223 10.6198 9.91667 10.3681 10.1346 10.1524L13.2404 7.07855L1.08975 7.07855C0.780985 7.07855 0.522171 6.97519 0.313303 6.76847C0.104436 6.56174 2.40517e-06 6.30559 2.43189e-06 6C2.4586e-06 5.69441 0.104436 5.43825 0.313304 5.23153C0.522171 5.0248 0.780985 4.92144 1.08975 4.92144L13.2404 4.92144Z" fill="currentColor"/>
                        </svg>
                      </a>
                      
                      <a href="/contact" className="page-link-button w-inline-block text-white/80 hover:text-white transition-colors duration-300 flex items-center justify-between group">
                        <div className="footer-link-text">Contact</div>
                        <svg viewBox="0 0 17 12" fill="none" className="mobile-horizon-arrow w-4 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <path d="M13.2404 4.92144L10.1346 1.84756C9.91667 1.63185 9.81223 1.38019 9.82132 1.09257C9.8304 0.804959 9.93483 0.553297 10.1346 0.337586C10.3526 0.121875 10.6114 0.00952527 10.9111 0.00053734C11.2107 -0.00845059 11.4696 0.0949107 11.6875 0.310622L16.6731 5.24501C16.891 5.46072 17 5.71238 17 6C17 6.28761 16.891 6.53928 16.6731 6.75499L11.6875 11.6894C11.4696 11.9051 11.2107 12.0084 10.9111 11.9995C10.6114 11.9905 10.3526 11.8781 10.1346 11.6624C9.93483 11.4467 9.8304 11.195 9.82131 10.9074C9.81223 10.6198 9.91667 10.3681 10.1346 10.1524L13.2404 7.07855L1.08975 7.07855C0.780985 7.07855 0.522171 6.97519 0.313303 6.76847C0.104436 6.56174 2.40517e-06 6.30559 2.43189e-06 6C2.4586e-06 5.69441 0.104436 5.43825 0.313304 5.23153C0.522171 5.0248 0.780985 4.92144 1.08975 4.92144L13.2404 4.92144Z" fill="currentColor"/>
                        </svg>
                      </a>
                    </div>

                    {/* Second Column of Links */}
                    <div className="space-y-4 flex-1">
                      <a href="/rooms" className="page-link-button w-inline-block text-white/80 hover:text-white transition-colors duration-300 flex items-center justify-between group">
                        <div className="footer-link-text">Rooms</div>
                        <svg viewBox="0 0 17 12" fill="none" className="mobile-horizon-arrow w-4 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <path d="M13.2404 4.92144L10.1346 1.84756C9.91667 1.63185 9.81223 1.38019 9.82132 1.09257C9.8304 0.804959 9.93483 0.553297 10.1346 0.337586C10.3526 0.121875 10.6114 0.00952527 10.9111 0.00053734C11.2107 -0.00845059 11.4696 0.0949107 11.6875 0.310622L16.6731 5.24501C16.891 5.46072 17 5.71238 17 6C17 6.28761 16.891 6.53928 16.6731 6.75499L11.6875 11.6894C11.4696 11.9051 11.2107 12.0084 10.9111 11.9995C10.6114 11.9905 10.3526 11.8781 10.1346 11.6624C9.93483 11.4467 9.8304 11.195 9.82131 10.9074C9.81223 10.6198 9.91667 10.3681 10.1346 10.1524L13.2404 7.07855L1.08975 7.07855C0.780985 7.07855 0.522171 6.97519 0.313303 6.76847C0.104436 6.56174 2.40517e-06 6.30559 2.43189e-06 6C2.4586e-06 5.69441 0.104436 5.43825 0.313304 5.23153C0.522171 5.0248 0.780985 4.92144 1.08975 4.92144L13.2404 4.92144Z" fill="currentColor"/>
                        </svg>
                      </a>
                      
                      <a href="/a-bunch-of-things" className="page-link-button w-inline-block text-white/80 hover:text-white transition-colors duration-300 flex items-center justify-between group">
                        <div className="footer-link-text">A Bunch of Things</div>
                        <svg viewBox="0 0 17 12" fill="none" className="mobile-horizon-arrow w-4 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <path d="M13.2404 4.92144L10.1346 1.84756C9.91667 1.63185 9.81223 1.38019 9.82132 1.09257C9.8304 0.804959 9.93483 0.553297 10.1346 0.337586C10.3526 0.121875 10.6114 0.00952527 10.9111 0.00053734C11.2107 -0.00845059 11.4696 0.0949107 11.6875 0.310622L16.6731 5.24501C16.891 5.46072 17 5.71238 17 6C17 6.28761 16.891 6.53928 16.6731 6.75499L11.6875 11.6894C11.4696 11.9051 11.2107 12.0084 10.9111 11.9995C10.6114 11.9905 10.3526 11.8781 10.1346 11.6624C9.93483 11.4467 9.8304 11.195 9.82131 10.9074C9.81223 10.6198 9.91667 10.3681 10.1346 10.1524L13.2404 7.07855L1.08975 7.07855C0.780985 7.07855 0.522171 6.97519 0.313303 6.76847C0.104436 6.56174 2.40517e-06 6.30559 2.43189e-06 6C2.4586e-06 5.69441 0.104436 5.43825 0.313304 5.23153C0.522171 5.0248 0.780985 4.92144 1.08975 4.92144L13.2404 4.92144Z" fill="currentColor"/>
                        </svg>
                      </a>
                      
                      <div className="coin-item-wrap hidden">
                        <div id="item_coin" className="hunt-item is-coin">
                          <div className="collect-img-wrap">
                            <img src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/67196a3f16f9a7f3ef8f914d_collected-item_coin.png" alt="" className="collect-image" />
                          </div>
                          <div className="discovered-item-background is-coin">
                            <div className="item-tunnel-image"></div>
                            <div className="blend-overlay coin-overlay"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="footer-cell final">
                  <div className="menu-cell-inner follow">
                    <div className="follow-panel">
                      <div className="padding-bottom padding-small">
                        <h4 className="follow-us-heading text-lg lg:text-xl text-white mb-6">Follow us</h4>
                      </div>
                      
                      <div className="follow-social-grid grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        <a href="https://discord.gg/rooms" target="_blank" className="footer-social-card w-inline-block bg-white/5 border border-white/10 rounded-xl p-3 lg:p-4 hover:bg-white/10 transition-all duration-300 group">
                          <div className="footer-social-icon-wrap mb-3">
                            <div className="footer-social-circle bg-white/10 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center">
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f3602a274968c5aa7bb8ff_footer_discord-night.svg" 
                                alt="Discord" 
                                className="footer-social-icon night-social-icon w-4 h-4 lg:w-5 lg:h-5"
                              />
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36059c82b1e5845d15655_footer_discord-day.svg" 
                                alt="Discord" 
                                className="footer-social-icon day-social-icon fade-out w-4 h-4 lg:w-5 lg:h-5"
                              />
                            </div>
                          </div>
                          <div className="footer-social-text text-white/80 group-hover:text-white text-xs lg:text-sm">Discord</div>
                        </a>
                        
                        <a href="https://www.tiktok.com/@things" target="_blank" className="footer-social-card w-inline-block bg-white/5 border border-white/10 rounded-xl p-3 lg:p-4 hover:bg-white/10 transition-all duration-300 group">
                          <div className="footer-social-icon-wrap mb-3">
                            <div className="footer-social-circle bg-white/10 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center">
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36058957f8216930752e7_footer_tiktok-night.svg" 
                                alt="TikTok" 
                                className="footer-social-icon night-social-icon w-4 h-4 lg:w-5 lg:h-5"
                              />
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36058d48d217d932d7ac5_footer_tiktok-day.svg" 
                                alt="TikTok" 
                                className="footer-social-icon day-social-icon fade-out w-4 h-4 lg:w-5 lg:h-5"
                              />
                            </div>
                          </div>
                          <div className="footer-social-text text-white/80 group-hover:text-white text-xs lg:text-sm">TikTok</div>
                        </a>
                        
                        <a href="https://www.instagram.com/things_incorporated/" target="_blank" className="footer-social-card w-inline-block bg-white/5 border border-white/10 rounded-xl p-3 lg:p-4 hover:bg-white/10 transition-all duration-300 group">
                          <div className="footer-social-icon-wrap mb-3">
                            <div className="footer-social-circle bg-white/10 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center">
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f3605861a90f310acdf217_footer_instagram-night.svg" 
                                alt="Instagram" 
                                className="footer-social-icon night-social-icon w-4 h-4 lg:w-5 lg:h-5"
                              />
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f360582d624b679becc8a8_footer_instagram-day.svg" 
                                alt="Instagram" 
                                className="footer-social-icon day-social-icon fade-out w-4 h-4 lg:w-5 lg:h-5"
                              />
                            </div>
                          </div>
                          <div className="footer-social-text text-white/80 group-hover:text-white text-xs lg:text-sm">Instagram</div>
                        </a>
                        
                        <a href="https://x.com/things" target="_blank" className="footer-social-card w-inline-block bg-white/5 border border-white/10 rounded-xl p-3 lg:p-4 hover:bg-white/10 transition-all duration-300 group">
                          <div className="footer-social-icon-wrap mb-3">
                            <div className="footer-social-circle bg-white/10 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center">
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f360584e79b06365002187_footer_x-night.svg" 
                                alt="X/Twitter" 
                                className="footer-social-icon night-social-icon w-4 h-4 lg:w-5 lg:h-5"
                              />
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36058b123ca59990b0d2c_footer_x-day.svg" 
                                alt="X/Twitter" 
                                className="footer-social-icon day-social-icon fade-out w-4 h-4 lg:w-5 lg:h-5"
                              />
                            </div>
                          </div>
                          <div className="footer-social-text text-white/80 group-hover:text-white text-xs lg:text-sm">X/Twitter</div>
                        </a>
                        
                        <a href="https://www.youtube.com/@things-inc" target="_blank" className="footer-social-card w-inline-block bg-white/5 border border-white/10 rounded-xl p-3 lg:p-4 hover:bg-white/10 transition-all duration-300 group">
                          <div className="footer-social-icon-wrap mb-3">
                            <div className="footer-social-circle bg-white/10 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center">
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f360594367a3be3f06f61a_footer_youtube-night.svg" 
                                alt="YouTube" 
                                className="footer-social-icon night-social-icon w-4 h-4 lg:w-5 lg:h-5"
                              />
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f36059e1b812491915e08b_footer_youtube-day.svg" 
                                alt="YouTube" 
                                className="footer-social-icon day-social-icon fade-out w-4 h-4 lg:w-5 lg:h-5"
                              />
                            </div>
                          </div>
                          <div className="footer-social-text text-white/80 group-hover:text-white text-xs lg:text-sm">YouTube</div>
                        </a>
                        
                        <a href="https://www.threads.net/@things_incorporated?hl=en" target="_blank" className="footer-social-card w-inline-block bg-white/5 border border-white/10 rounded-xl p-3 lg:p-4 hover:bg-white/10 transition-all duration-300 group">
                          <div className="footer-social-icon-wrap mb-3">
                            <div className="footer-social-circle bg-white/10 w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center">
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f3609217acabd402d408dc_footer_threads-night.svg" 
                                alt="Threads" 
                                className="footer-social-icon night-social-icon w-4 h-4 lg:w-5 lg:h-5"
                              />
                              <img 
                                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f3605939c6b8addd616a6c_footer_threads-day.svg" 
                                alt="Threads" 
                                className="footer-social-icon day-social-icon fade-out w-4 h-4 lg:w-5 lg:h-5"
                              />
                            </div>
                          </div>
                          <div className="footer-social-text text-white/80 group-hover:text-white text-xs lg:text-sm">Threads</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Utility Panels */}
              <div id="w-node-_03512f23-37f8-2a95-dabd-285d50de1b7d-50de1b10" className="footer-utility-panel desktop-tablet hidden lg:flex justify-between items-center mt-16 pt-8 border-t border-white/10">
                <div className="footer-utility-text text-white/60 text-sm">© Things Inc. 2025</div>
                <div className="flex items-center space-x-6">
                  <div className="text-color-option-2">
                    <a href="/terms" className="utility-link text-white/60 hover:text-white transition-colors duration-300 text-sm">Terms & Conditions</a>
                  </div>
                  <div className="text-color-option-2">
                    <a href="/privacy" className="utility-link text-white/60 hover:text-white transition-colors duration-300 text-sm">Privacy Policy</a>
                  </div>
                  <div className="footer-utility-text">
                    <a href="/assets" className="utility-link text-white/60 hover:text-white transition-colors duration-300 text-sm">Media Assets</a>
                  </div>
                </div>
              </div>

              <div id="w-node-_0678f53e-8aa8-ef71-7cd2-d0f3ed3ad6f8-50de1b10" className="footer-utility-panel mobile lg:hidden mt-8 pt-6 border-t border-white/10 text-center space-y-3">
                <div className="footer-utility-text style-2 text-white/60 text-sm">© Things Inc. 2025</div>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <div className="text-color-option-2">
                    <a href="/terms" className="utility-link style-2 text-white/60 hover:text-white transition-colors duration-300 text-xs sm:text-sm">Terms & Conditions</a>
                  </div>
                  <div className="text-color-option-2">
                    <a href="/privacy" className="utility-link style-2 text-white/60 hover:text-white transition-colors duration-300 text-xs sm:text-sm">Privacy Policy</a>
                  </div>
                </div>
                <div className="footer-utility-text style-2 text-white/60 text-xs">
                  Website by <a href="#" target="_blank" className="utility-link style-2 text-white/60 hover:text-white transition-colors duration-300 underline">Psychoactive Studios</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Clouds */}
        <div className="floating-cloud top-right absolute top-8 right-4 lg:top-12 lg:right-8 pointer-events-none">
          <div 
            className="cloud-mover third"
            style={{
              willChange: 'transform',
              transform: 'translate3d(4.999rem, -1.4425rem, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            <img 
              src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367536d9cdf539095c9eb_footer-cloud-right_night.png" 
              alt="Floating cloud" 
              className="floating-cloud-image night-cloud-image show-hero-cloud w-24 sm:w-32 lg:w-48 h-auto opacity-60"
              sizes="(max-width: 657px) 100vw, 657px"
              srcSet="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367536d9cdf539095c9eb_footer-cloud-right_night-p-500.png 500w, https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367536d9cdf539095c9eb_footer-cloud-right_night.png 657w"
            />
            <img 
              src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a804f8c9cd92a372ce_footer-cloud-right_day.png" 
              alt="Floating cloud" 
              className="floating-cloud-image day-cloud-image hide-hero-cloud w-24 sm:w-32 lg:w-48 h-auto opacity-60"
              sizes="(max-width: 657px) 100vw, 657px"
              srcSet="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a804f8c9cd92a372ce_footer-cloud-right_day-p-500.png 500w, https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a804f8c9cd92a372ce_footer-cloud-right_day.png 657w"
            />
          </div>
        </div>
        
        <div className="floating-cloud top-left absolute top-8 left-4 lg:top-12 lg:left-8 pointer-events-none">
          <div 
            className="cloud-mover first"
            style={{
              willChange: 'transform',
              transform: 'translate3d(2.9994rem, -0.8655rem, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            <img 
              src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a85cb2687ca4e30838_footer-clouds-left_night.png" 
              alt="Floating cloud" 
              className="floating-cloud-image night-cloud-image show-hero-cloud w-28 sm:w-36 lg:w-52 h-auto opacity-40"
              sizes="(max-width: 717px) 100vw, 717px"
              srcSet="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a85cb2687ca4e30838_footer-clouds-left_night-p-500.png 500w, https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a85cb2687ca4e30838_footer-clouds-left_night.png 717w"
            />
            <img 
              src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a8274968c5aa82329f_footer-clouds-left_day.png" 
              alt="Floating cloud" 
              className="floating-cloud-image day-cloud-image hide-hero-cloud w-28 sm:w-36 lg:w-52 h-auto opacity-40"
              sizes="(max-width: 717px) 100vw, 717px"
              srcSet="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a8274968c5aa82329f_footer-clouds-left_day-p-500.png 500w, https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a8274968c5aa82329f_footer-clouds-left_day.png 717w"
            />
          </div>
        </div>
        
        <div className="floating-cloud bottom-left absolute bottom-8 left-4 lg:bottom-12 lg:left-8 pointer-events-none">
          <div 
            className="cloud-mover second"
            style={{
              willChange: 'transform',
              transform: 'translate3d(0.9998rem, -0.2885rem, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            <img 
              src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a8a723298ff33cee0f_footer-clouds-bottom_night.png" 
              alt="Floating cloud" 
              className="floating-cloud-image night-cloud-image show-hero-cloud w-24 sm:w-28 lg:w-40 h-auto opacity-50"
            />
            <img 
              src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66f367a805dd39bee16d5312_footer-clouds-bottom_day.png" 
              alt="Floating cloud" 
              className="floating-cloud-image day-cloud-image hide-hero-cloud w-24 sm:w-28 lg:w-40 h-auto opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Footer Background with Stars */}
      <div className="custom-background footer-bg absolute inset-0 -z-10">
        <div id="aboutStars" className="stars-overlay footer-stars"></div>
      </div>
    </div>
  );
}

export default memo(FooterSection);