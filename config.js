
/**
 * Definitions export
 * This is where sidebar menu items are defined.
 */
export const definitions = [
    {
        name: "Pet Store (Local)",
        url: "./definitions/petstore.swagger.yaml",
    },
    {
        name: "Pet Store (Remote)",
        url: "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v2.0/json/petstore.json",
    },
];

/**
 * Sidebar customizations
 * You can update the title and customize the sidebar theme
 */
export const sidebarConfig = {
    title: "Swagger UI with Sidebar",
    // Extend the theme to include custom colors, fonts, etc
    extendTheme: {
        // Learn more about color theme: https://chakra-ui.com/docs/styled-system/theming/theme#colors
        colors: {
            brand: {
				"50": "#E6FFFA",
				"100": "#B2F5EA",
				"200": "#81E6D9",
				"300": "#4FD1C5",
				"400": "#38B2AC",
				"500": "#319795",
				"600": "#2C7A7B",
				"700": "#285E61",
				"800": "#234E52",
				"900": "#1D4044"
},
        },
    },
};

// Props that will be passed to the SwaggerUI component
// See available props here: https://www.npmjs.com/package/swagger-ui-react
export const swaggerUIProps = {
    queryConfigEnabled: true,
}
