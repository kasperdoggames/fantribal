import { classNames } from "../support/helpers";
import { toIpfsGatewayURL } from "../support/ipfsGateway";

export type Tab = {
  name: string;
  href: string;
  current: boolean;
};

const ArtistProfileHeader = (props: {
  bandId: number;
  bandName: string;
  bandCover: string;
  tabs: Tab[];
}) => {
  const { bandName, bandCover, tabs } = props;

  const currentTabName = () => tabs.find((tab) => tab.current)?.name || "";

  return (
    <div className="sticky top-0 z-30 bg-gray-800 shadow-2xl shadow-white/20">
      <div className="absolute inset-0">
        <img
          className="object-cover w-full h-full opacity-50"
          src={toIpfsGatewayURL(bandCover)}
          alt=""
        />
        <div className="absolute inset-0 " aria-hidden="true" />
      </div>
      <div className="relative px-4 py-8 pt-8 pb-10 mx-auto text-white max-w-7xl sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-14 md:text-5xl lg:text-6xl">
          {bandName}
        </h1>
        <div className="flex items-center justify-between pt-8">
          <div>
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
              <select
                id="tabs"
                name="tabs"
                className="block w-full text-gray-700 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                defaultValue={currentTabName()}
              >
                {tabs.map((tab) => (
                  <option key={tab.name}>{tab.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex space-x-4" aria-label="Tabs">
                {tabs.map((tab) => (
                  <a
                    key={tab.name}
                    href={tab.href}
                    className={classNames(
                      tab.current
                        ? "bg-white text-gray-700"
                        : "text-gray-300 hover:text-gray-100",
                      "px-3 py-2 font-medium text-sm rounded-md"
                    )}
                    aria-current={tab.current ? "page" : undefined}
                  >
                    {tab.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>
          <div className="flex justify-end text-sm text-white">
            {currentTabName() === "Timeline" && (
              <div className="flex flex-col">
                <p>TRIBE MEMBERS</p>
                <p className="flex justify-end ">12</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfileHeader;
