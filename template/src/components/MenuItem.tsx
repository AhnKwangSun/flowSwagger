import { Flex, Icon } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IMenuItemProps {
  icon?: any | React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export const MenuItem = (props: IMenuItemProps) => {
  const { icon, children, isActive, ...rest } = props;
  return (
    <Flex
      align="center"
      px="4"
      mx="2"
      rounded="md"
      py="3"
      cursor="pointer"
      bg={isActive ? "blackAlpha.300" : "transparent"}
      color={`whiteAlpha.${isActive ? "900" : "700"}`}
      _hover={{
        color: "whiteAlpha.900",
      }}
      role="group"
      fontWeight={isActive ? "bold" : "semibold"}
      transition=".15s ease"
      {...rest}
    >
      {icon && (
        // <Icon
        //   mr="2"
        //   boxSize="4"
        //   _groupHover={{
        //     color: "gray.300",
        //   }}
        //   as={icon}
        // />
        <FontAwesomeIcon icon={["fal", "boxing-glove"]} />
      )}
      {children}
    </Flex>
  );
};
