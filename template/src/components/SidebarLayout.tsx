import {
  useDisclosure,
  useColorModeValue,
  Flex,
  Box,
  Text,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  IconButton,
  BoxProps,
} from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import { MenuItem } from "./MenuItem";
import { Logo } from "./Logo";
import { IDefinition } from "../types";
interface ISidebarLayoutProps {
  definition: IDefinition;
  definitions: IDefinition[];
  onDefinitionClick: (definition: IDefinition) => void;
  title: string;
  topNavItems?: React.ReactNode[];
  children: React.ReactNode;
  logoInfo: {
    src: string;
    alt: string;
    width: string;
    display: string;
    minWidth: string;
    padding: string;
    borderRadius: string;
    background: string;
  }
}
export function SidebarLayout({
  children,
  title,
  onDefinitionClick,
  definitions,
  definition,
  topNavItems,
  logoInfo,
}: ISidebarLayoutProps) {
  const sidebar = useDisclosure();
  const SidebarContent = (props: BoxProps) => (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="full"
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      bg={useColorModeValue("brand.400", "gray.800")}
      borderColor={useColorModeValue("inherit", "gray.700")}
      borderRightWidth="1px"
      w="80"
      {...props}
    >
      <Flex flexDirection={"column"} px="8" pt="5" align="center">
        <Logo {...logoInfo} />
        <Text
          fontSize="2xl"
          mt={2}
          color={useColorModeValue("brand.900", "white")}
          fontWeight="semibold"
          align={"center"}
        >
          {title}
        </Text>
      </Flex>
      <Flex
        direction="column"
        as="nav"
        fontSize="sm"
        color="gray.600"
        aria-label="Main Navigation"
      >
        {definitions.map((definitionItem) => {
          return (
            <MenuItem
              icon={definitionItem?.icon}
              isActive={definitionItem?.name === definition?.name}
              key={definitionItem?.name}
              onClick={() => onDefinitionClick(definitionItem)}
            >
              {definitionItem.name}
            </MenuItem>
          );
        })}
      </Flex>
    </Box>
  );
  return (
    <Box as="section" minH="100vh" w="full">
      <SidebarContent display={{ base: "none", md: "unset" }} />
      <Drawer
        isOpen={sidebar.isOpen}
        onClose={sidebar.onClose}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent w="full" borderRight="none" />
        </DrawerContent>
      </Drawer>
      <Box ml={{ base: 0, md: 60 }} transition=".3s ease">
        <Flex
          as="header"
          align="center"
          justify="space-between"
          w="full"
          pt={2}
        >
          <IconButton
            aria-label="Menu"
            display={{ base: "inline-flex", md: "none" }}
            onClick={sidebar.onOpen}
            icon={<FiMenu />}
            size="sm"
          />
        </Flex>

        <Box
          mt={10}
          h={"90vh"}
          borderWidth="4px"
          borderStyle="dashed"
          rounded="md"
          as="main"
          overflow={"auto"}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
