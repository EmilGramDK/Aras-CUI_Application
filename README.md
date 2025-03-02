# CUI Application Aras Solution

This Aras Community Project introduces an ItemType designed to serve as a central hub for all custom applications within Aras Innovator. It enhances navigation by adding a new "Applications" button to the header, which opens a sidebar displaying all registered applications. This streamlined approach makes it easier for users to quickly access and manage applications across the organization.

![Aras App Sidebar](./Documentation/aras-app-sidebar.png)

## History

| Release | Notes          |
| ------- | -------------- |
| 1.0.0   | First release. |

#### Supported Aras Versions

| Project | Aras |
| ------- | ---- |
| 1.0.0   | R30  |

## Installation

#### Important!

**Always back up your code tree and database before applying an import package or code tree patch!**

### Pre-requisites

1. Aras Innovator installed (version 25 till 30)
2. [Aras Update](http://www.aras.com/support/downloads/) installed (version 1.18 or later)
3. CUI Application Solution (version 1.0.0) - [download here](https://github.com/EmilGramDK/Aras-CUI_Application/releases/download/V1.0.0/Aras-CUI_Application_V1.0.0.zip)

### Install Steps

<!-- TODO: Add screenshot(s) -->

1. Run Aras Update.
2. Select **Local** in the sidebar.
3. Click **Add package reference** and select the CUI Application installation package.
4. Select the newly added package from the list and click **Install**.
5. Select the components you want to install and click **Next**.
   - Aras Innovator Code Tree Updates
   - Aras Innovator Database Updates
6. Choose **Detailed Logging** and click **Next**.
7. Enter the required parameters for the target Aras Innovator instance. Which parameters are required varies based on which components you have selected to install.
   - When selecting the install path for your Innovator instance, be sure to select the Innovator subfolder.
   - Example: If your Innovator instance is installed in `C:\Program Files (x86)\Aras\R30`, select `C:\Program Files (x86)\Aras\R30\Innovator`.
8. Click **Install** to begin installing the package.
9. When the package finishes installing, close Aras Update.

## Usage

For information on using the sample application, view [the documentation for CUI Application](./Documentation/Guide.md).

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License

CUI Application are published to Github under the MIT license. See the [LICENSE file](./LICENSE.md) for license rights and limitations.
