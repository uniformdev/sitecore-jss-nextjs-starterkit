import Link from '../SitecoreNavLink/SitecoreNavLink';

function NavLinks() {
  return (
    <>
      <Link href="/architecture">
        <a style={{padding: "10px"}} className="font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition duration-150 ease-in-out">
          Architecture
        </a>
      </Link>
      <Link href="/development">
        <a style={{padding: "10px"}} className="font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition duration-150 ease-in-out">
          Development
        </a>
      </Link>
      <Link href="/marketing">
        <a style={{padding: "10px"}} className="font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition duration-150 ease-in-out">
          Marketing
        </a>
      </Link>
      <Link href="/security">
        <a style={{padding: "10px"}} className="font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition duration-150 ease-in-out">
          Security
        </a>
      </Link>
    </>
  );
}

export default NavLinks;