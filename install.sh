#! /usr/bin/env bash
echo "This script should be run in Oruga's folder, you should cd that folder and then run it."
echo "(Remember that npm, in order to work properly, needs the /usr/bin/env python to point to a python2 version, not a python3!!)"
echo "This will install mime-magic, tagnode and cradle"
echo "Are you in it? Enter to continue (if not hit CTRl-C)"
read

echo "Installing Dependencies"

echo "    * Installing mime-magic"
npm install mime-magic

echo "    * Installing tagnode"
wget https://github.com/downloads/NickCis/TagNode/tagnode-1.0.0.tgz
npm install tagnode-1.0.0.tgz

echo "    * Installion craddle"
npm install cradle

echo "Installation finished"
