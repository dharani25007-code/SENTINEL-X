"""
Unit tests for the IOGP rule tagger.

These run entirely locally with no API key or network access — they test
the semantic matching logic against known report-to-rule mappings.
"""

import pytest

from app.rule_tagger import tag_rule, get_all_rules, get_backend_info


def test_tag_rule_returns_valid_structure():
    """tag_rule should return a dict with rule, rule_id, confidence, icon."""
    result = tag_rule("Worker was welding near a gas line without a fire watch.")
    assert "rule" in result
    assert "rule_id" in result
    assert "confidence" in result
    assert "icon" in result
    assert isinstance(result["confidence"], float)
    assert 0.0 <= result["confidence"] <= 1.0


def test_hot_work_report_matches_hot_work_rule():
    """A report about welding near flammables should match Hot Work."""
    result = tag_rule("Contractor was welding near an open valve with gas smell. No fire watch.")
    assert result["rule"] == "Hot Work"


def test_confined_space_report_matches_confined_space_rule():
    """A report about entering a tank without gas testing should match Confined Space."""
    result = tag_rule("Worker entered a storage tank without atmosphere testing or standby attendant.")
    assert result["rule"] == "Confined Space"


def test_working_at_height_report_matches():
    """A report about climbing without a harness should match Working at Height."""
    result = tag_rule("Employee climbed to 8 meters high without a harness or fall arrest system.")
    assert result["rule"] == "Working at Height"


def test_energy_isolation_report_matches():
    """A report about maintenance without LOTO should match Energy Isolation."""
    result = tag_rule("Technician began maintenance on a pump without lockout tagout. Pump still powered.")
    assert result["rule"] == "Energy Isolation"


def test_driving_report_matches():
    """A report about unsafe driving should match Driving."""
    result = tag_rule("Driver using mobile phone while operating heavy tanker truck on access road.")
    assert result["rule"] == "Driving"


def test_line_of_fire_report_matches():
    """A report about being in the path of moving equipment should match Line of Fire."""
    result = tag_rule("Worker standing inside swing radius of excavator boom while it was digging.")
    assert result["rule"] == "Line of Fire"


def test_lifting_report_matches():
    """A report about walking under a suspended load should match Safe Mechanical Lifting."""
    result = tag_rule("Workers walked underneath suspended load while crane was lifting drill pipe.")
    assert result["rule"] == "Safe Mechanical Lifting"


def test_bypassing_safety_controls_report_matches():
    """A report about overriding an interlock should match Bypassing Safety Controls."""
    result = tag_rule("Worker bypassed interlock guard on rotating equipment to clear jam while machine running.")
    assert result["rule"] == "Bypassing Safety Controls"


def test_work_authorisation_report_matches():
    """A report about missing permit-to-work should match Work Authorisation."""
    result = tag_rule("Work began on live electrical panel without permit-to-work signed off by area authority.")
    assert result["rule"] == "Work Authorisation"


def test_get_all_rules_returns_nine():
    """There should be exactly 9 IOGP Life-Saving Rules."""
    rules = get_all_rules()
    assert len(rules) == 9


def test_backend_info_returns_string():
    """get_backend_info should return a non-empty string."""
    info = get_backend_info()
    assert isinstance(info, str)
    assert info in ("sentence-transformers", "tfidf")
