<mo-ai-code type="page" pageid="page_component_sidebar_drawer">
const {
  wpm,
  React,
  NextUI,
  FramerMotion
} = context;

const { Drawer, DrawerBody, DrawerContent } = NextUI;
const { TRANSITION_EASINGS } = FramerMotion;

const SidebarDrawer = React.forwardRef(({
  children,
  className,
  onOpenChange,
  isOpen,
  sidebarWidth = 288,
  classNames = {},
  sidebarPlacement = "left",
  motionProps: drawerMotionProps,
  ...props
}, ref) => {
  const motionProps = React.useMemo(() => {
    if (!!drawerMotionProps && typeof drawerMotionProps === "object") {
      return drawerMotionProps;
    }

    return {
      variants: {
        enter: {
          x: 0,
          transition: {
            x: {
              duration: 0.3,
              ease: TRANSITION_EASINGS.easeOut,
            },
          },
        },
        exit: {
          x: sidebarPlacement == "left" ? -sidebarWidth : sidebarWidth,
          transition: {
            x: {
              duration: 0.2,
              ease: TRANSITION_EASINGS.easeOut,
            },
          },
        },
      },
    };
  }, [sidebarWidth, sidebarPlacement, drawerMotionProps]);

  return (
    <>
      <Drawer
        ref={ref}
        {...props}
        classNames={{
          ...classNames,
          wrapper: `!w-[var(--sidebar-width)] ${classNames?.wrapper} ${
            sidebarPlacement === "left" 
              ? "!items-start !justify-start"
              : "!items-end !justify-end"
          }`,
          base: `w-[var(--sidebar-width)] !m-0 p-0 h-full max-h-full ${
            sidebarPlacement === "left"
              ? "inset-y-0 left-0 max-h-[none] rounded-l-none !justify-start"
              : "inset-y-0 right-0 max-h-[none] rounded-r-none !justify-end"
          } ${className} ${classNames?.base}`,
          body: `p-0 ${classNames?.body}`,
          closeButton: `z-50 ${classNames?.closeButton}`,
        }}
        isOpen={isOpen}
        motionProps={motionProps}
        radius="none"
        scrollBehavior="inside"
        style={{
          "--sidebar-width": `${sidebarWidth}px`,
        }}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          <DrawerBody>{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
      <div className={`hidden h-full max-w-[var(--sidebar-width)] overflow-x-hidden overflow-y-scroll sm:flex ${className}`}>
        {children}
      </div>
    </>
  );
});

SidebarDrawer.displayName = "SidebarDrawer";

wpm.export('page_component_sidebar_drawer', SidebarDrawer);
</mo-ai-code>