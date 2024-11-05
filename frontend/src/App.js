import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Disclosure, DisclosureButton, DisclosurePanel, Switch } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import Dashboard from './Dashboard';
import Products from './Products';

const navigation = [
  { name: "Dashboard", href: "/", current: true },
  { name: "Products", href: "/products", current: false }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Disclosure as="nav" className="bg-gray-600 dark:bg-gray-700">
        {({ open }) => (
          <React.Fragment>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  {/* <div className="flex flex-shrink-0 items-center">
                    <img
                      className="block h-8 w-auto lg:hidden"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                      alt="Your Company"
                    />
                    <img
                      className="hidden h-8 w-auto lg:block"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                      alt="Your Company"
                    />
                  </div> */}
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map(item => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            location.pathname === item.href
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                          aria-current={location.pathname === item.href ? 'page' : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <Switch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    className={`${darkMode ? 'bg-gray-700 shadow-[0_0_10px_rgba(255,255,255,0.6)]' : 'bg-gray-300'}
                    relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ease-in-out`}
                  >
                    <span className="sr-only">Toggle Dark Mode</span>
                    <span
                      className={`${darkMode ? 'translate-x-8 bg-white' : 'translate-x-1 bg-gray-400'}
                      inline-block h-6 w-6 transform rounded-full transition-transform duration-300 ease-in-out`}
                    />
                  </Switch>
                </div>
              </div>
            </div>

            <DisclosurePanel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map(item => (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      location.pathname === item.href
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={location.pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
            </DisclosurePanel>
          </React.Fragment>
        )}
      </Disclosure>
      <Routes>
        <Route path="/" element={<Dashboard darkMode={darkMode} />} />
        <Route path="/products" element={<Products darkMode={darkMode} />} />
      </Routes>
    </div>
  );
}

export default App;