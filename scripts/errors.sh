#!/bin/bash
cat ../results.txt | grep -E "ERRORS" | sed -e "s/\*\*\*\*\*//g" -e "s/-repacked\.xpi: ADDON ERRORS FOUND//g" > errors.txt
