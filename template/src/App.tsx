import path from "path";
import SwaggerUI from "swagger-ui-react";
import { Box, HStack, Grid } from "@chakra-ui/react";
import { SidebarLayout } from "./components/SidebarLayout.js";
import { ColorModeSwitcher } from "./components/ColorModeSwitcher";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { IDefinition } from "./types/index.js";

import { definitions, sidebarConfig, swaggerUIProps } from "../../config";

import "swagger-ui-react/swagger-ui.css";

function App() {
  const [definition, setDefinition] = useLocalStorage<IDefinition>(
    "definition",
    definitions[0]
  );

  return (
    <Box fontSize="xl">
      <Grid minW="100vw" minH="100vh" px={28}>
        <HStack justify={"center"}>
          <SidebarLayout
            logoInfo={sidebarConfig.logo}
            definition={definition}
            onDefinitionClick={setDefinition}
            definitions={definitions}
            title={sidebarConfig?.title || ""}
            topNavItems={[<ColorModeSwitcher aria-label="" />]}
          >
            <SwaggerUI {...swaggerUIProps} url={definition.url} />
          </SidebarLayout>
        </HStack>
      </Grid>
    </Box>
  );
}

export default App;
