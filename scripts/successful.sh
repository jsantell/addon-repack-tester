#!/bin/bash
cat ../results.txt | grep -E "SUCCESS" | sed -e "s/\*\*\*\*\*//g" -e "s/-repacked\.xpi: SUCCESS//g" | sort -u >  success.txt
