#!/usr/bin/env bash
echo "Running script deploy_firebase.sh..."

if ! [ -x "$(command -v firebase)"]; then
  echo "Error: firebase-tools not installed."
  exit 1
fi

firebase deploy --token $FIREBASE_TOKEN
echo "Script deploy_firebase.sh done."