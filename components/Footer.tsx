const Footer = () => {
  return (
    <>
      <footer className="w-full bg-[#1B0848] text-white px-6">
        <div className="container flex flex-wrap items-center justify-between py-6 mx-auto text-sm max-w-8xl md:flex-no-wrap">
          &copy;{new Date().getFullYear()} FanTribal. All rights reserved.
          <div className="pt-4 text-xs text-center md:p-0 md:text-right">
            <a href="#" className="no-underline hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="ml-4 no-underline hover:underline">
              Terms &amp; Conditions
            </a>
            <a href="#" className="ml-4 no-underline hover:underline">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
