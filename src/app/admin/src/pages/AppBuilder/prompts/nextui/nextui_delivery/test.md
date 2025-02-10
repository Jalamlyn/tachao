<mo-ai-code type="component" name="comp_navbar" title="Navbar Component">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  ReactRouterDom
} = context;

const { Navbar: NextUINavbar, NavbarContent, NavbarBrand, NavbarItem, Link } = NextUI;

const Navbar = observer(() => {
  return (
    <NextUINavbar maxWidth="fluid" className="bg-background border-b border-divider">
      <NavbarBrand>
        <p className="font-bold text-xl">我的民宿</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/">
            首页
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/rooms">
            客房
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/gallery">
            画廊
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/about">
            关于民宿
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/contact">
            联系我们
          </Link>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
});

Navbar.displayName = 'Navbar';
context.wpm.export('comp_navbar', Navbar);