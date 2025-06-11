{ pkgs }: {
  # REPLIT NIX DERIVATION - DEVELOPMENT ENVIRONMENT DEFINITION
  #
  # PURPOSE AND RATIONALE:
  # This file defines the minimal Nix environment required when running on
  # Replit. Only a small subset of packages is needed because the project is a
  # static site with Node-based tooling. Providing just the language servers
  # keeps the environment lightweight while enabling editor features such as
  # IntelliSense and linting. Additional dependencies can be added here if
  # future development tooling requires them.
  deps = [                                  # packages made available in the shell
    pkgs.nodePackages.vscode-langservers-extracted  # provides HTML/CSS/JS language support
    pkgs.nodePackages.typescript-language-server     # supports TS/JS editing features
  ];
}
