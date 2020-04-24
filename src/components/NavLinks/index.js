import Link from '../SitecoreNavLink/SitecoreNavLink';

function NavLinks() {
  return (
    <>
      <Link href="/fr-FR/about">
        <a className="font-medium text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition duration-150 ease-in-out">
          About
        </a>
      </Link>
    </>
  );
}

export default NavLinks;
