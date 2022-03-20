import { useContext } from "react";
import { WalletContext } from "../services/providers/MintbaseWalletContext";
import { Disclosure } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { classNames } from "../support/helpers";

const navigation = [
  { name: "Home", href: "/", current: false, connectionRequired: false },
  { name: "Bands", href: "/bands", current: false, connectionRequired: false },
  {
    name: "My NFTs",
    href: "/myNFTs",
    current: false,
    connectionRequired: true,
  },
  {
    name: "Venues",
    href: "/venues",
    current: false,
    connectionRequired: true,
  },
];

const Header = ({ currentPageHref }: { currentPageHref: string }) => {
  const { wallet, isConnected } = useContext(WalletContext);
  navigation.map((nav) => {
    if (nav.href === currentPageHref) {
      nav.current = true;
    } else {
      nav.current = false;
    }
  });

  return (
    <Disclosure as="nav" className="bg-[#1B0848]">
      {({ open }) => (
        <>
          <div className="px-2 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block w-6 h-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex items-center justify-center flex-1 sm:justify-start">
                <div className="flex items-center flex-shrink-0">
                  <img
                    className="block w-auto h-12"
                    src="/logo.png/"
                    alt="Logo"
                  />
                </div>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex items-center space-x-4">
                    {navigation.map(
                      (item) =>
                        (!item.connectionRequired ||
                          (item.connectionRequired && isConnected)) && (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-white text-gray-700"
                                : "text-gray-300 hover:text-gray-100",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        )
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  className="p-2 text-sm text-white no-underline bg-indigo-600 rounded-lg"
                  onClick={
                    isConnected
                      ? () => {
                          wallet?.disconnect();
                          window.location.reload();
                        }
                      : () => {
                          wallet?.connect({ requestSignIn: true });
                        }
                  }
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-violet-500 text-white"
                      : "text-violet-100 hover:bg-violet-300 hover:text-white",
                    "block px-3 py-2 rounded-md text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header;
