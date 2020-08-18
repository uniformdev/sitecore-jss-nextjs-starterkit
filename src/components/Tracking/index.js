import { useState, useEffect, useContext } from 'react';
import { TrackerContext } from '@uniformdev/tracking-react';

function formatDate(value) {
  if (isNaN(Date.parse(value))) {
    return undefined;
  }
  const date = new Date(value);
  return `${date.toDateString()} ${date.toLocaleTimeString()}`;
}

function formatNumber(value) {
  if (isNaN(value)) {
    return "";
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function DisplayData({data, className}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
          <table className="min-w-full">
            <tbody>
              {Object.keys(data).map(key => {
                return (
                  <tr key={key} className="bg-white">
                    <td className="align-top px-3 py-2 whitespace-no-wrap text-sm leading-2 font-medium text-gray-900">
                      {key}
                    </td>
                    <td className="align-top px-3 py-2 whitespace-no-wrap text-sm leading-2 text-gray-500">
                      {data[key]}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Visitor({visitor}) {
  const values = {
    "Id": visitor?.id,
    "Last updated": formatDate(visitor?.updated),
    "Profiles last updated": formatDate(visitor?.data?.profiles?.date),
    "Value": visitor?.data?.value?.data ?? 0,
    "Visit count": visitor?.visits?.length ?? 0,
  };
  return (
    <DisplayData data={values} />
  )
}

function Visit({visit}) {
  const values = {
    "Id": visit?.id,
    "Started": formatDate(visit?.start),
    "Last updated": formatDate(visit?.updated),
    "Profiles last updated": formatDate(visit?.data?.profiles?.date),
    "Value": visit?.data?.value?.data ?? 0
  };
  return (
    <DisplayData data={values} />
  )
}

function getProfileKeys(profile) {
  if (!profile) {
    return undefined;
  }
  const profileKeys = Object.keys(profile.keys).map(key => {
    return profile.keys[key];
  });
  const compare = (a,b) => {
    if (a.name>b.name) return 1;
    if (a.name<b.name) return -1;
    return 0;
  }
  return profileKeys.sort(compare);
}

function getProfileKeyDetails(profile) {
  const profileKeys = getProfileKeys(profile);
  const details = [];
  if (details) {
    Object.keys(profileKeys).forEach(key => {
      const profileKey = profileKeys[key];
      const score = formatNumber(profileKey.value);
      details.push(<div key={key}>{profileKey.name} = {score}</div>)
    });
  }
  return details;
}

function getPatternDetails(pattern) {
  const details = [
    <div key="name">Name = {pattern?.name}</div>,
    <div key="distance">Distance = {formatNumber(pattern?.distance)}</div>,
  ];
  return details;
}

function Profiles({profiles, patterns}) {
  const components = [];
  if (profiles?.data) {
    Object.keys(profiles.data).forEach(key => {
      const profile = profiles.data[key];
      const pattern = patterns?.data[key];
      const values = {
        "Name": profile?.name,
        "Pattern": getPatternDetails(pattern),
        "Profile keys": getProfileKeyDetails(profile),
        "Update count": profile?.updateCount ?? 0
      };
      const margin = components.length == 0 ? 0 : 4;
      components.push(<DisplayData className={`mt-${margin}`} key={key} data={values} />);
    })
  }
  return components;
}

export default function Tracking() {
  const [isOpen, setIsOpen] = useState(false);
  const [visitor, setVisitor] = useState(undefined);
  const [visit, setVisit] = useState(undefined);
  const context = useContext(TrackerContext);
  useEffect(() => {
    const unsubs = [];
    unsubs.push(context.subscriptions.subscribe("tracker-set", e => {
      if (e.tracker) {
        unsubs.push(e.tracker.subscribe("tracking-finished", e2 => {
          if (e2.visitor) {
            setVisitor(e2.visitor);
          }
          if (e2.visit) {
            setVisit(e2.visit);
          }
        }));
      }
    }));
    return function cleanup() {
      unsubs.forEach(unsub => unsub());
    }
  }, []);

  // useEffect(() => {
  //   setVisitor(window?.uniform?.visitor);
  //   setVisit(window?.uniform?.visit);
  // });
  
  return (
    <div>
      <div>
        <span className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
          >
            {isOpen ? 'Hide' : 'Show'} profile
          </button>
        </span>
      </div>
      {isOpen && (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Uniform Tracker Information</h3>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-500">
              Information that the Uniform Tracker has been configured to capture.
            </p>
          </div>
          <div>
            <dl>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm leading-5 font-medium text-gray-500">Visit</dt>
                <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  <Visit visit={visit} />
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm leading-5 font-medium text-gray-500">Visitor</dt>
                <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  <Visitor visitor={visitor} />
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm leading-5 font-medium text-gray-500">Profiles (visit)</dt>
                <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  <Profiles profiles={visit?.data?.profiles} patterns={visit?.data?.patterns} />
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm leading-5 font-medium text-gray-500">Profiles (visitor)</dt>
                <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  <Profiles profiles={visitor?.data?.profiles} patterns={visitor?.data?.patterns} />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
