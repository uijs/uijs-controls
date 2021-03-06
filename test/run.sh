#!/bin/bash
echo "Running catest tests"
for x in `ls *.cantest.js`; do
    cantest $x --no-browse || (
      echo "Test $x failed"
      exit 1
    );
done
echo "Running functional tests"
for x in `ls *.test.js`; do 
    node $x || (
        echo "Test $x failed"
        exit 1
    );
done
