# Contribute

## Add your module

### Clone this repository

```bash
git clone git@github.com:foxted/nestjs-modules.git
```

### Create a new branch

```bash
git checkout -b my-module
```

### Adding a new category (optional)

If you want to add a new category, you can do so by adding an item in the `modules/categories.yml` file.

> Make sure you create your category before adding your module.

### Adding your module .yml file

#### Manually

You can manually add your file in `modules/[type]` directory, naming it `[module].yml` (e.g. `modules/official/axios.yml`).: 

### Generator

You can also use our generator to create your module file. Run the following command and follow the instructions.
The generated file will be located in the `modules/[type]` directory.

```bash
# Run this and follow the instructions
npm run generate:module
```

### Adding your module icon

If you want to add an icon for your module, you can do so by adding an image in the `/icons` directory, naming it `[module].svg` (e.g. `modules/icons/axios.svg`).

> Only `.svg` files are supported.

### Commit your changes

```bash
git add .
git commit -m "feat: add my-module"
```

### Push your changes

```bash
git push origin my-module
```

### Create a pull request

Go to [foxted/nestjs-modules](https://github.com/foxted/nestjs-modules/pulls) and create a new pull request using the "Add a module" template.
