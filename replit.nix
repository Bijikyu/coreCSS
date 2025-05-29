{ pkgs }: {
  # Nix environment ensuring TypeScript and VS Code language support on Replit
  deps = [ # packages made available in the shell
    pkgs.nodePackages.vscode-langservers-extracted
    pkgs.nodePackages.typescript-language-server
  ];
}
