from os import environ, listdir
import os
from os.path import getmtime, isfile, join
from sys import platform
from time import sleep
from typing import Any
from xml.etree.ElementTree import parse

from .Config import get_ed_appdata_path
from .EDlogger import logger
from .directinput import PressKey, ReleaseKey, SCANCODE

"""
Description:  Pulls the keybindings for specific controls from the ED Key Bindings file, this class also
  has method for sending a key to the display that has focus (so must have ED with focus)

Constraints:  This file will use the latest modified *.binds file
"""


class EDKeys:

    def __init__(self, appdata_path: str):
        self.appdata_path = appdata_path
        self.key_mod_delay = 0.010
        self.key_default_delay = 0.200
        self.key_repeat_delay = 0.100
        self.keys_to_obtain = [
            'PrimaryFire',
            'SecondaryFire',
            'HyperSuperCombination',
            'SetSpeedZero',
            'SetSpeed50',
            'SetSpeed100',
            'DeployHeatSink',
            'DeployHardpointToggle',
            'IncreaseEnginesPower',
            'IncreaseWeaponsPower',
            'IncreaseSystemsPower',
            'GalaxyMapOpen',
            'SystemMapOpen',
            'CycleNextTarget',
            'CycleFireGroupNext',
            'ShipSpotLightToggle',
            'EjectAllCargo',
            'LandingGearToggle',
            'UseShieldCell',
            'FireChaffLauncher',
            'NightVisionToggle',
            'RecallDismissShip',
            'SelectHighestThreat',
            'ToggleCargoScoop',
            'ChargeECM',
            #'CycleNextPanel',
            'UI_Up',
            'UI_Right',
            'UI_Select',
            'UI_Back',
        ]
        self.keys = self.get_bindings(self.keys_to_obtain)

        self.missing_keys = []
        # dump config to log
        for key in self.keys_to_obtain:
            if not key in self.keys:
                self.missing_keys.append(key)

    def get_bindings(self, keys_to_obtain) -> dict[str, Any]:
        """Returns a dict struct with the direct input equivalent of the necessary elite keybindings"""
        direct_input_keys = {}
        convert_to_direct_keys = {
            'Key_LeftShift': 'LShift',
            'Key_RightShift': 'RShift',
            'Key_LeftAlt': 'LAlt',
            'Key_RightAlt': 'RAlt',
            'Key_LeftControl': 'LControl',
            'Key_RightControl': 'RControl',
            'Key_LeftBracket': 'LBracket',
            'Key_RightBracket': 'RBracket'
        }

        latest_bindings = self.get_latest_keybinds()
        if not latest_bindings:
            return {}
        bindings_tree = parse(latest_bindings)
        bindings_root = bindings_tree.getroot()

        for item in bindings_root:
            if item.tag in self.keys_to_obtain:
                key = None
                mod = None
                hold = None
                # Check primary
                if item[0].attrib['Device'].strip() == "Keyboard":
                    key = item[0].attrib['Key']
                    if len(item[0]) > 0:
                        if item[0][0].tag == "Modifier":
                            mod = item[0][0].attrib['Key']
                        elif item[0][0].tag == "Hold":
                            hold = True
                # Check secondary (and prefer secondary)
                if item[1].attrib['Device'].strip() == "Keyboard":
                    key = item[1].attrib['Key']
                    mod = None
                    hold = None
                    if len(item[1]) > 0:
                        if item[1][0].tag == "Modifier":
                            mod = item[1][0].attrib['Key']
                        elif item[1][0].tag == "Hold":
                            hold = True
                # Adequate key to SCANCODE dict standard
                if key in convert_to_direct_keys:
                    key = convert_to_direct_keys[key]
                elif key is not None:
                    key = key[4:]
                # Adequate mod to SCANCODE dict standard
                if mod in convert_to_direct_keys:
                    mod = convert_to_direct_keys[mod]
                elif mod is not None:
                    mod = mod[4:]
                # Prepare final binding
                binding: None | dict[str, Any] = None
                try:
                    if key is not None:
                        binding = {}
                        binding['pre_key'] = 'DIK_' + key.upper()
                        binding['key'] = SCANCODE[binding['pre_key']]
                        if mod is not None:
                            binding['pre_mod'] = 'DIK_' + mod.upper()
                            binding['mod'] = SCANCODE[binding['pre_mod']]
                        if hold is not None:
                            binding['hold'] = True
                except KeyError:
                    print("Unrecognised key '" + (binding['pre_key'] if binding else '?')  + "' for bind '" + item.tag + "'")
                if binding is not None:
                    direct_input_keys[item.tag] = binding

        if len(list(direct_input_keys.keys())) < 1:
            return {}
        else:
            return direct_input_keys

    # Note:  this routine will grab the *.binds file which is the latest modified
    def get_latest_keybinds(self):
        path_bindings = os.path.join(self.appdata_path+'/', "Options", "Bindings")
        try:
            list_of_bindings = [join(path_bindings, f) for f in listdir(path_bindings) if
                                isfile(join(path_bindings, f)) and f.endswith('.binds')]
        except FileNotFoundError as e:
            return None

        if not list_of_bindings:
            return None
        latest_bindings = max(list_of_bindings, key=getmtime)
        return latest_bindings

    def send_key(self, type, key):
        if type == 'Up':
            ReleaseKey(key)
        else:
            PressKey(key)

    def send(self, key_name, hold=None, repeat=1, repeat_delay=None, state=None):
        key = self.keys.get(key_name)
        if key is None:
            # logger.warning('SEND=NONE !!!!!!!!')
            raise Exception(
                f"Unable to retrieve keybinding for {key_name}. Advise user to check game settings for keyboard bindings.")

        for i in range(repeat):

            if state is None or state == 1:
                if 'mod' in key:
                    PressKey(key['mod'])
                    sleep(self.key_mod_delay)

                PressKey(key['key'])

            if state is None:
                if hold:
                    sleep(hold)
                else:
                    sleep(self.key_default_delay)

            if 'hold' in key:
                sleep(0.1)

            if state is None or state == 0:
                ReleaseKey(key['key'])

                if 'mod' in key:
                    sleep(self.key_mod_delay)
                    ReleaseKey(key['mod'])

            if repeat_delay:
                sleep(repeat_delay)
            else:
                sleep(self.key_repeat_delay)


def main():
    k = EDKeys()
    # k.send(k.keys['ExplorationFSSEnter'], hold=3)


if __name__ == "__main__":
    main()
