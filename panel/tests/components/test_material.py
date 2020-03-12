from panel.components.material import MaterialButton
def test_handle_unelevated_change():
    # Given
    button = MaterialButton()
    
    #  When
    button.unelevated = False
    button.outlined = True
    button.unelevated = True
    assert button.outlined == False

    # When
    button.unelevated = False
    button.raised= True
    button.unelevated = True
    assert button.raised == False